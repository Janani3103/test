export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ExtractionField {
  id: string;
  key: string;
  label: string;
  value: string | number;
  category: string;
  confidence: ConfidenceLevel;
  verified?: boolean;
  sourceSnippet?: string;
  page?: number;
}

export interface ExtractionTable {
  id: string;
  title: string;
  headers: string[];
  rows: (string | number)[][];
  page?: number;
}

export interface ExtractionEntity {
  name: string;
  type: 'organization' | 'person' | 'date' | 'location' | 'amount' | 'identifier' | 'other';
  context?: string;
  page?: number;
}

export interface ExtractionMetadata {
  detectedLanguage?: string;
  confidenceScore?: number;
  pageCount?: number;
  layoutType?: 'standard_single_page' | 'multi_page_document' | 'two_column' | 'tabular_dense' | 'form_grid' | 'unstructured_flowing';
  processingTimeMs?: number;
  dateExtracted: string;
  fileName: string;
  fileType: string;
  fileSizeBytes?: number;
}

export interface StructuredExtractionData {
  documentType: string;
  summary: string;
  layoutAnalysis?: {
    layoutType: string;
    totalPages: number;
    hasDenseTables: boolean;
    hasHeadersFooters: boolean;
    hasMultiColumns: boolean;
  };
  keyFields: ExtractionField[];
  tables: ExtractionTable[];
  entities: ExtractionEntity[];
  metadata: ExtractionMetadata;
  rawJson: Record<string, any>;
}

export type PresetType = 'auto' | 'invoice' | 'contract' | 'resume' | 'medical' | 'receipt' | 'custom';

export interface CustomFieldDef {
  id: string;
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'currency' | 'boolean';
  description: string;
  required?: boolean;
}

export interface CustomSchemaConfig {
  name: string;
  description: string;
  fields: CustomFieldDef[];
  includeTables: boolean;
  customPromptRules: string;
}

export interface DocumentPage {
  pageNumber: number;
  textContent?: string;
  previewUrl?: string;
  base64?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: number;
  base64?: string;
  textContent?: string;
  previewUrl?: string;
  pages?: DocumentPage[];
  totalPages?: number;
  isSample?: boolean;
  sampleId?: string;
}

export interface SessionHistoryEntry {
  id: string;
  timestamp: number;
  document: DocumentItem;
  preset: PresetType;
  result: StructuredExtractionData;
}
