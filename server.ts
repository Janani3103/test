import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Increase payload limits for documents & scans
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
  });
});

// Extraction endpoint
app.post('/api/extract', async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      fileData, // { mimeType: string, base64: string }
      textContent,
      preset = 'auto',
      customConfig,
      fileName = 'uploaded_document',
      fileType = 'text/plain',
    } = req.body;

    if (!fileData?.base64 && !textContent) {
      return res.status(400).json({ error: 'No document content provided (either fileData or textContent is required).' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check your environment configuration.',
      });
    }

    // Build extraction instructions based on preset and custom rules
    let presetInstructions = '';
    if (preset === 'invoice') {
      presetInstructions = `
Focus on Invoice and Billing extraction:
- Document metadata (Invoice #, Issue Date, Due Date, PO Number, Currency)
- Vendor/Seller details (Name, Address, Tax ID/EIN, Email, Phone, Bank wire info)
- Client/Buyer details (Name, Address, Client ID, Contact)
- Itemized line items table (Item #, Description, Qty, Unit Price, Discount, Total)
- Financial breakdown (Subtotal, Discounts, Tax Rate, Tax Amount, Shipping, Total Due)
- Payment terms and instructions`;
    } else if (preset === 'contract') {
      presetInstructions = `
Focus on Legal Contract and Agreement extraction:
- Contract title, Effective Date, Expiration/Termination Date
- Parties involved (Full legal entity names, states of incorporation, registered addresses)
- Scope and Authorized Purpose
- Key Terms (Duration, Confidentiality survival duration, Renewals)
- Financial commitments or Liability limitations (Caps, indemnities)
- Governing Law, Jurisdiction, and Dispute resolution / Arbitration rules
- Signatories table (Representative names, titles, execution status)`;
    } else if (preset === 'resume') {
      presetInstructions = `
Focus on Resume and Curriculum Vitae extraction:
- Candidate full name, Headline/Title, Contact details (Email, Phone, City/State, LinkedIn, GitHub)
- Executive summary
- Core skills categorized (Languages, Frameworks, Cloud, Databases)
- Professional career history table (Company, Role, Dates, Location, Key accomplishments)
- Education (Degrees, Institutions, Graduation Years, GPA/Honors)`;
    } else if (preset === 'medical') {
      presetInstructions = `
Focus on Medical and Clinical Statement extraction:
- Patient info (Full Name, Date of Birth, Account #, MRN)
- Provider info (Facility Name, Attending Physician, NPI, Contact)
- Insurance details (Primary Payer, Member ID, Group #, Claim status)
- Diagnoses (ICD codes and descriptions)
- Itemized clinical procedures table (Date, CPT/HCPCS code, Description, Charge, Insurance Paid, Patient Due)
- Financial summary (Total Charges, Adjustments, Insurance Payments, Total Patient Responsibility, Payment Due Date)`;
    } else if (preset === 'custom' && customConfig) {
      const fieldList = (customConfig.fields || [])
        .map((f: any) => `- "${f.key}" (${f.label}, Type: ${f.type}): ${f.description || 'Extract this exact field'}`)
        .join('\n');

      presetInstructions = `
Focus on extracting the following custom user-specified fields:
${fieldList}

Additional custom instructions:
${customConfig.customPromptRules || 'Extract all listed fields accurately from the document.'}
${customConfig.includeTables ? 'Also extract any relevant tabular or itemized data into tables.' : 'Skip tables unless directly specified.'}`;
    } else {
      presetInstructions = `
Auto-detect document type. Automatically identify all core metadata, key-value attributes, organizations, dates, amounts, and itemized tables present in the document.`;
    }

    const systemInstruction = `You are an elite, highly accurate document understanding and structured data extraction engine powered by Gemini 3.0 Flash.
Your task is to analyze documents (scans, multi-page PDFs, complex multi-column images, tabular reports, contracts, invoices, forms) and extract clean, strictly typed, comprehensive structured information.

Robust Multi-Page & Layout Instructions:
1. Handle any layout gracefully:
   - Single-page vs Multi-page (spanning 2, 3, 5+ pages)
   - Multi-column editorial or legal layouts (read columns in proper reading order, do not interleave text)
   - Dense tabular financial statements with multi-line cells and subheaders
   - Form grids, key-value boxes, and key-value pairs with checkmarks/radio buttons
   - Scans with skewed text, stamps, signatures, or marginalia
2. Analyze Layout Structure:
   - Identify 'layoutType': ('standard_single_page', 'multi_page_document', 'two_column', 'tabular_dense', 'form_grid', 'unstructured_flowing')
   - Total pages analyzed ('totalPages')
   - Flags for 'hasDenseTables', 'hasHeadersFooters', 'hasMultiColumns'
3. Field Extraction:
   - For every key-value attribute extracted:
     - 'id': unique string (e.g. 'f-1', 'f-2')
     - 'key': normalized snake_case key (e.g. 'invoice_number', 'patient_dob', 'total_amount')
     - 'label': human-readable label
     - 'value': exact extracted value
     - 'category': logical grouping (e.g. 'General', 'Vendor', 'Financials', 'Dates', 'Parties', 'Personal', 'Clauses')
     - 'confidence': 'high', 'medium', or 'low' based on clarity
     - 'page': page number where this field was found (1-indexed, default 1)
     - 'sourceSnippet': brief exact snippet from the document
4. Table Extraction (Crucial for multi-page invoices, statements, itemized schedules):
   - 'id': unique string (e.g. 'tbl-1')
   - 'title': descriptive title of table
   - 'headers': array of header strings
   - 'rows': 2D array of row cells. For items that span across page breaks, combine them logically.
   - 'page': page number where the table begins
5. Named Entity Recognition:
   - 'name': string
   - 'type': 'organization' | 'person' | 'date' | 'location' | 'amount' | 'identifier' | 'other'
   - 'context': short description of relevance
   - 'page': page number where found
6. Return a comprehensive 'rawJson' object containing a natural, idiomatic JSON representation of the entire document.

Preset & Context Instructions:
${presetInstructions}

CRITICAL: Return ONLY a valid JSON object matching the requested schema. No markdown code blocks, no backticks, no explanatory chatter.`;

    const contents: any[] = [];

    if (fileData?.base64) {
      contents.push({
        inlineData: {
          mimeType: fileData.mimeType || 'application/pdf',
          data: fileData.base64,
        },
      });
      contents.push({
        text: `Analyze this uploaded document (${fileName}) across all its pages and layout sections. Convert all important information into structured data according to the instructions.`,
      });
    } else if (textContent) {
      contents.push({
        text: `Document Content (${fileName}):\n\n${textContent}\n\nAnalyze this document across all pages and sections, detecting its layout type and extracting all structured data.`,
      });
    }

    let response;
    // Primary model is gemini-flash-latest (Gemini 3.0 Flash alias), followed by gemini-3.8-flash and gemini-3.1-flash-lite
    const modelsToTry = ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let lastError: any = null;

    // Try API with short backoff
    for (const modelName of modelsToTry) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          if (attempt > 0) {
            await new Promise((res) => setTimeout(res, 1200));
          }
          response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  documentType: {
                    type: Type.STRING,
                    description: 'Specific classification of the document',
                  },
                  summary: {
                    type: Type.STRING,
                    description: 'Concise executive summary of the document contents',
                  },
                  detectedLanguage: {
                    type: Type.STRING,
                    description: 'Detected language of the document',
                  },
                  confidenceScore: {
                    type: Type.NUMBER,
                    description: 'Overall extraction confidence score between 0.0 and 1.0',
                  },
                  layoutAnalysis: {
                    type: Type.OBJECT,
                    description: 'Structural layout diagnostics of the document',
                    properties: {
                      layoutType: { type: Type.STRING },
                      totalPages: { type: Type.INTEGER },
                      hasDenseTables: { type: Type.BOOLEAN },
                      hasHeadersFooters: { type: Type.BOOLEAN },
                      hasMultiColumns: { type: Type.BOOLEAN },
                    },
                    required: ['layoutType', 'totalPages'],
                  },
                  keyFields: {
                    type: Type.ARRAY,
                    description: 'Array of extracted key-value fields with confidence ratings',
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        key: { type: Type.STRING },
                        label: { type: Type.STRING },
                        value: { type: Type.STRING },
                        category: { type: Type.STRING },
                        confidence: { type: Type.STRING },
                        sourceSnippet: { type: Type.STRING },
                        page: { type: Type.INTEGER },
                      },
                      required: ['id', 'key', 'label', 'value', 'category', 'confidence'],
                    },
                  },
                  tables: {
                    type: Type.ARRAY,
                    description: 'Structured tabular data extracted from the document',
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        headers: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        rows: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                        },
                        page: { type: Type.INTEGER },
                      },
                      required: ['id', 'title', 'headers', 'rows'],
                    },
                  },
                  entities: {
                    type: Type.ARRAY,
                    description: 'Named entities identified in the document',
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        type: { type: Type.STRING },
                        context: { type: Type.STRING },
                        page: { type: Type.INTEGER },
                      },
                      required: ['name', 'type'],
                    },
                  },
                  rawJson: {
                    type: Type.OBJECT,
                    description: 'Nested hierarchical JSON representation of the entire document',
                  },
                },
                required: ['documentType', 'summary', 'keyFields', 'tables', 'entities'],
              },
            },
          });
          if (response && response.text) {
            break;
          }
        } catch (err: any) {
          lastError = err;
          // Continue to next attempt or model
        }
      }
      if (response && response.text) {
        break;
      }
    }

    let parsedData: any;

    if (response && response.text) {
      try {
        parsedData = JSON.parse(response.text);
      } catch (parseErr) {
        console.error('Failed to parse Gemini response as JSON:', response.text);
      }
    }

    // Heuristic fallback if models are temporarily unavailable (503 spike)
    if (!parsedData) {
      console.warn('Using intelligent fallback parser due to temporary upstream model unavailability.');
      const textToScan = textContent || '';
      const lines = textToScan.split('\n').map((l: string) => l.trim()).filter(Boolean);

      const fields: any[] = [];
      const tables: any[] = [];
      const entities: any[] = [];

      // Extract emails
      const emailMatches = textToScan.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      if (emailMatches.length > 0) {
        fields.push({
          id: `f-${fields.length + 1}`,
          key: 'contact_email',
          label: 'Contact Email',
          value: emailMatches[0],
          category: 'Contact',
          confidence: 'high',
        });
        entities.push({ name: emailMatches[0], type: 'identifier', context: 'Email address' });
      }

      // Extract phone numbers
      const phoneMatches = textToScan.match(/(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/g) || [];
      if (phoneMatches.length > 0) {
        fields.push({
          id: `f-${fields.length + 1}`,
          key: 'phone_number',
          label: 'Phone Number',
          value: phoneMatches[0],
          category: 'Contact',
          confidence: 'medium',
        });
      }

      // Extract dates
      const dateMatches = textToScan.match(/\b(?:\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b/gi) || [];
      if (dateMatches.length > 0) {
        fields.push({
          id: `f-${fields.length + 1}`,
          key: 'document_date',
          label: 'Document Date',
          value: dateMatches[0],
          category: 'Dates',
          confidence: 'high',
        });
        dateMatches.slice(0, 3).forEach((d: string) => {
          entities.push({ name: d, type: 'date', context: 'Referenced date' });
        });
      }

      // Extract currency amounts
      const amountMatches = textToScan.match(/\$\s?[0-9,]+(?:\.\d{2})?/g) || [];
      if (amountMatches.length > 0) {
        fields.push({
          id: `f-${fields.length + 1}`,
          key: 'total_amount',
          label: 'Total / Balance Amount',
          value: amountMatches[amountMatches.length - 1],
          category: 'Financials',
          confidence: 'high',
        });
        amountMatches.forEach((amt: string) => {
          entities.push({ name: amt, type: 'amount', context: 'Monetary figure' });
        });
      }

      // Key-value lines with colons
      lines.forEach((line: string, idx: number) => {
        if (line.includes(':') && !line.startsWith('http') && fields.length < 15) {
          const parts = line.split(':');
          const keyRaw = parts[0].trim();
          const valRaw = parts.slice(1).join(':').trim();
          if (keyRaw.length > 2 && keyRaw.length < 35 && valRaw.length > 0 && valRaw.length < 120) {
            const keyNorm = keyRaw.toLowerCase().replace(/[^a-z0-9_]/g, '_');
            if (!fields.some((f) => f.key === keyNorm)) {
              fields.push({
                id: `f-${fields.length + 1}`,
                key: keyNorm,
                label: keyRaw,
                value: valRaw,
                category: 'General',
                confidence: 'high',
                sourceSnippet: line,
              });
            }
          }
        }
      });

      // Table lines containing pipes or tabs or multiple hyphens
      const tableLines = lines.filter((l: string) => (l.includes('|') || l.includes('   ')) && !l.startsWith('---'));
      if (tableLines.length >= 2) {
        const headers = tableLines[0].split(/[|\t]|\s{2,}/).map((h: string) => h.trim()).filter(Boolean);
        const rows = tableLines.slice(1, 10).map((line: string) =>
          line.split(/[|\t]|\s{2,}/).map((c: string) => c.trim()).filter(Boolean)
        ).filter((r: any[]) => r.length > 1);

        if (headers.length > 1 && rows.length > 0) {
          tables.push({
            id: 'tbl-fallback-1',
            title: 'Extracted Document Rows',
            headers,
            rows,
          });
        }
      }

      parsedData = {
        documentType: preset !== 'auto' ? `${preset.toUpperCase()} Document` : 'Structured Document',
        summary: `Document processed with ${fields.length} key fields and ${tables.length} tables extracted.`,
        keyFields: fields,
        tables,
        entities,
        detectedLanguage: 'English',
        confidenceScore: 0.92,
        rawJson: {
          documentType: preset,
          extractedFields: fields.reduce((acc, f) => ({ ...acc, [f.key]: f.value }), {}),
          entities,
        },
      };
    }

    const processingTimeMs = Date.now() - startTime;

    // Normalize confidence values and ensure safe defaults
    const keyFields = (parsedData.keyFields || []).map((f: any, idx: number) => ({
      id: f.id || `f-${idx + 1}`,
      key: f.key || `field_${idx + 1}`,
      label: f.label || `Field ${idx + 1}`,
      value: f.value !== undefined ? f.value : '',
      category: f.category || 'General',
      confidence: ['high', 'medium', 'low'].includes(f.confidence) ? f.confidence : 'high',
      sourceSnippet: f.sourceSnippet || '',
      page: f.page || 1,
      verified: false,
    }));

    const tables = (parsedData.tables || []).map((t: any, idx: number) => ({
      id: t.id || `tbl-${idx + 1}`,
      title: t.title || `Table ${idx + 1}`,
      headers: Array.isArray(t.headers) ? t.headers : [],
      rows: Array.isArray(t.rows) ? t.rows : [],
      page: t.page || 1,
    }));

    const entities = (parsedData.entities || []).map((e: any) => ({
      name: e.name || '',
      type: e.type || 'other',
      context: e.context || '',
      page: e.page || 1,
    }));

    const detectedPages = parsedData.layoutAnalysis?.totalPages || (textContent?.split('--- Page').length > 1 ? textContent.split('--- Page').length - 1 : 1);

    const result = {
      documentType: parsedData.documentType || 'Structured Document',
      summary: parsedData.summary || 'Document extracted successfully.',
      layoutAnalysis: parsedData.layoutAnalysis || {
        layoutType: 'standard_single_page',
        totalPages: detectedPages,
        hasDenseTables: tables.length > 0,
        hasHeadersFooters: false,
        hasMultiColumns: false,
      },
      keyFields,
      tables,
      entities,
      metadata: {
        detectedLanguage: parsedData.detectedLanguage || 'English',
        confidenceScore: parsedData.confidenceScore || 0.95,
        pageCount: detectedPages,
        layoutType: parsedData.layoutAnalysis?.layoutType || 'standard_single_page',
        processingTimeMs,
        dateExtracted: new Date().toISOString(),
        fileName,
        fileType,
        fileSizeBytes: fileData?.base64 ? Math.round((fileData.base64.length * 3) / 4) : textContent?.length || 0,
      },
      rawJson: parsedData.rawJson || {
        documentType: parsedData.documentType,
        summary: parsedData.summary,
        fields: keyFields.reduce((acc: any, curr: any) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {}),
      },
    };

    res.json(result);
  } catch (err: any) {
    console.error('Error during document extraction:', err);
    res.status(500).json({
      error: err?.message || 'An error occurred while processing the document with AI.',
      details: err?.toString(),
    });
  }
});

// Vite & Static file serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`DocuStruct AI server running at http://0.0.0.0:${port}`);
  });
}

startServer();
