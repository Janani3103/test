import { StructuredExtractionData, DocumentItem } from '../types/extraction';

export interface SampleDocConfig {
  item: DocumentItem;
  defaultPreset: 'invoice' | 'contract' | 'resume' | 'medical';
  description: string;
  badge: string;
  defaultData: StructuredExtractionData;
}

export const SAMPLE_DOCUMENTS: SampleDocConfig[] = [
  {
    item: {
      id: 'sample-invoice',
      name: 'Invoice_INV-2026-8841_ApexCloud.pdf',
      type: 'application/pdf',
      size: 42800,
      isSample: true,
      sampleId: 'sample-invoice',
      textContent: `APEX CLOUD ARCHITECTURE LLC
100 Silicon Blvd, Suite 400
Austin, TX 78701
Tax ID / EIN: 84-2947192
Email: billing@apexcloud.io | Phone: (512) 555-0192

INVOICE

Invoice Number: INV-2026-8841
Invoice Date: September 15, 2026
Payment Due Date: October 15, 2026
PO Number: PO-99420-US
Currency: USD ($)

BILL TO:
NextGen Retail Platforms Inc.
Attn: Accounts Payable
742 Market Street, 12th Floor
San Francisco, CA 94103
Client ID: CUST-4412

LINE ITEMS:
---------------------------------------------------------------------------------------------------------
#   Description                                     Qty    Unit Price ($)    Discount    Total ($)
---------------------------------------------------------------------------------------------------------
1   Multi-Region Kubernetes Cluster Migration       80 hrs       $225.00        5%       $17,100.00
2   Zero-Trust IAM & OIDC Security Hardening       35 hrs       $250.00        0%        $8,750.00
3   Terraform Infrastructure-as-Code Pipeline       45 hrs       $195.00        0%        $8,775.00
4   Dedicated Production SRE On-Call Support (Sep)   1 mo     $4,500.00        0%        $4,500.00
5   Database Read Replica Latency Optimization      20 hrs       $210.00       10%        $3,780.00
---------------------------------------------------------------------------------------------------------

FINANCIAL SUMMARY:
Subtotal: $42,905.00
Discounts Applied: -$1,320.00
Taxable Amount: $41,585.00
State & City Sales Tax (8.25%): $3,430.76
Total Amount Due: $45,015.76

PAYMENT INSTRUCTIONS:
Wire Transfer / ACH:
Bank Name: Silicon Valley Commerce Bank
Routing Number: 121000358
Account Number: 9948210488
SWIFT Code: SVCBUS33
Please include invoice number INV-2026-8841 in the wire memo.
Payment Terms: Net 30. Overdue payments accrue 1.5% interest per month.`,
    },
    defaultPreset: 'invoice',
    description: 'B2B Cloud Consulting Invoice with line items, tax, and banking details',
    badge: 'Finance / B2B',
    defaultData: {
      documentType: 'Commercial Invoice',
      summary: 'Professional cloud migration and infrastructure services billed by Apex Cloud Architecture LLC to NextGen Retail Platforms Inc.',
      keyFields: [
        { id: 'f-1', key: 'invoice_number', label: 'Invoice Number', value: 'INV-2026-8841', category: 'General', confidence: 'high', verified: true },
        { id: 'f-2', key: 'invoice_date', label: 'Invoice Date', value: '2026-09-15', category: 'Dates', confidence: 'high', verified: true },
        { id: 'f-3', key: 'due_date', label: 'Payment Due Date', value: '2026-10-15', category: 'Dates', confidence: 'high', verified: true },
        { id: 'f-4', key: 'vendor_name', label: 'Vendor Name', value: 'Apex Cloud Architecture LLC', category: 'Vendor', confidence: 'high' },
        { id: 'f-5', key: 'vendor_tax_id', label: 'Vendor EIN/Tax ID', value: '84-2947192', category: 'Vendor', confidence: 'high' },
        { id: 'f-6', key: 'customer_name', label: 'Billed Client', value: 'NextGen Retail Platforms Inc.', category: 'Customer', confidence: 'high' },
        { id: 'f-7', key: 'po_number', label: 'Purchase Order #', value: 'PO-99420-US', category: 'General', confidence: 'high' },
        { id: 'f-8', key: 'payment_terms', label: 'Payment Terms', value: 'Net 30', category: 'Payment', confidence: 'medium' },
        { id: 'f-9', key: 'subtotal', label: 'Subtotal Amount', value: 42905.00, category: 'Totals', confidence: 'high' },
        { id: 'f-10', key: 'tax_amount', label: 'Sales Tax (8.25%)', value: 3430.76, category: 'Totals', confidence: 'high' },
        { id: 'f-11', key: 'total_due', label: 'Total Amount Due', value: 45015.76, category: 'Totals', confidence: 'high', verified: true },
        { id: 'f-12', key: 'currency', label: 'Currency', value: 'USD', category: 'Totals', confidence: 'high' },
      ],
      tables: [
        {
          id: 'tbl-items',
          title: 'Invoice Line Items',
          headers: ['Item #', 'Description', 'Quantity', 'Unit Price ($)', 'Discount', 'Total ($)'],
          rows: [
            ['1', 'Multi-Region Kubernetes Cluster Migration', '80 hrs', '$225.00', '5%', '$17,100.00'],
            ['2', 'Zero-Trust IAM & OIDC Security Hardening', '35 hrs', '$250.00', '0%', '$8,750.00'],
            ['3', 'Terraform Infrastructure-as-Code Pipeline', '45 hrs', '$195.00', '0%', '$8,775.00'],
            ['4', 'Dedicated Production SRE On-Call Support (Sep)', '1 mo', '$4,500.00', '0%', '$4,500.00'],
            ['5', 'Database Read Replica Latency Optimization', '20 hrs', '$210.00', '10%', '$3,780.00'],
          ],
        },
      ],
      entities: [
        { name: 'Apex Cloud Architecture LLC', type: 'organization', context: 'Service Provider / Vendor' },
        { name: 'NextGen Retail Platforms Inc.', type: 'organization', context: 'Client / Debtor' },
        { name: 'Silicon Valley Commerce Bank', type: 'organization', context: 'Remittance Bank' },
        { name: 'Austin, TX', type: 'location', context: 'Vendor Headquarters' },
        { name: '$45,015.76', type: 'amount', context: 'Total Invoice Balance' },
        { name: '2026-10-15', type: 'date', context: 'Net 30 Due Date' },
      ],
      metadata: {
        detectedLanguage: 'English (US)',
        confidenceScore: 0.99,
        pageCount: 1,
        processingTimeMs: 820,
        dateExtracted: '2026-09-24T23:50:00Z',
        fileName: 'Invoice_INV-2026-8841_ApexCloud.pdf',
        fileType: 'application/pdf',
        fileSizeBytes: 42800,
      },
      rawJson: {
        invoice: {
          number: 'INV-2026-8841',
          date: '2026-09-15',
          dueDate: '2026-10-15',
          poNumber: 'PO-99420-US',
          currency: 'USD',
          vendor: {
            name: 'Apex Cloud Architecture LLC',
            ein: '84-2947192',
            address: '100 Silicon Blvd, Suite 400, Austin, TX 78701',
            email: 'billing@apexcloud.io',
          },
          client: {
            name: 'NextGen Retail Platforms Inc.',
            id: 'CUST-4412',
            address: '742 Market Street, 12th Floor, San Francisco, CA 94103',
          },
          financials: {
            subtotal: 42905.00,
            discount: 1320.00,
            taxRate: '8.25%',
            taxAmount: 3430.76,
            totalDue: 45015.76,
          },
        },
      },
    },
  },
  {
    item: {
      id: 'sample-contract',
      name: 'Master_Services_and_NDA_Agreement.pdf',
      type: 'application/pdf',
      size: 58200,
      totalPages: 2,
      pages: [
        {
          pageNumber: 1,
          textContent: `--- Page 1 of 2: MUTUAL NON-DISCLOSURE AND INTELLECTUAL PROPERTY AGREEMENT ---

This Mutual Non-Disclosure Agreement (the "Agreement") is entered into as of August 1, 2026 (the "Effective Date"), by and between:

DISCLOSING / RECEIVING PARTY A:
QuantumScale Technologies Inc., a Delaware corporation with its principal executive office at 500 Enterprise Way, Boston, MA 02110 ("QuantumScale"), and

DISCLOSING / RECEIVING PARTY B:
Vanguard Data Systems S.A., a Swiss corporation with its registered seat at Rue du Rhône 42, 1204 Geneva, Switzerland ("Vanguard").

1. PURPOSE
The parties wish to explore a potential strategic alliance, software co-development, and cross-border API integration in the field of autonomous query optimization (the "Authorized Purpose").

2. CONFIDENTIAL INFORMATION DEFINITION
"Confidential Information" shall mean all non-public, proprietary information, including but not limited to source code, algorithms, customer lists, architectural diagrams, benchmark results, and commercial terms disclosed orally, in writing, or electronically.

3. TERM AND OBLIGATIONS OF NON-DISCLOSURE
(a) Term of Agreement: This Agreement shall remain in full force for a period of three (3) years from the Effective Date, expiring automatically on August 1, 2029.
(b) Survival Period: The obligations of non-disclosure and protection of Trade Secrets shall survive indefinitely, and for all other Confidential Information shall endure for five (5) years following termination.`,
        },
        {
          pageNumber: 2,
          textContent: `--- Page 2 of 2: IP RIGHTS, LIABILITY & EXECUTION ---

4. INTELLECTUAL PROPERTY RIGHTS
Neither party transfers any patent, copyright, trademark, or trade secret rights under this Agreement. All pre-existing Intellectual Property remains the sole and exclusive property of the originating party.

5. LIMITATION OF LIABILITY
Neither party's aggregate monetary liability for breach of non-willful disclosure under this Agreement shall exceed USD $2,500,000. Injunctive relief shall be available without posting bond.

6. GOVERNING LAW AND ARBITRATION
This Agreement shall be construed, interpreted, and governed under the laws of the State of New York, United States, without regard to its conflict of laws principles. Any unresolved disputes shall be submitted to binding arbitration before the American Arbitration Association (AAA) in New York, NY.

IN WITNESS WHEREOF, the authorized representatives have executed this Agreement:
For QuantumScale Technologies Inc.: Elena Rostova, Chief Executive Officer (Signed Aug 1, 2026)
For Vanguard Data Systems S.A.: Marc Dubois, Managing Director (Signed Aug 1, 2026)`,
        },
      ],
      isSample: true,
      sampleId: 'sample-contract',
      textContent: `--- Page 1 of 2: MUTUAL NON-DISCLOSURE AND INTELLECTUAL PROPERTY AGREEMENT ---

This Mutual Non-Disclosure Agreement (the "Agreement") is entered into as of August 1, 2026 (the "Effective Date"), by and between:

DISCLOSING / RECEIVING PARTY A:
QuantumScale Technologies Inc., a Delaware corporation with its principal executive office at 500 Enterprise Way, Boston, MA 02110 ("QuantumScale"), and

DISCLOSING / RECEIVING PARTY B:
Vanguard Data Systems S.A., a Swiss corporation with its registered seat at Rue du Rhône 42, 1204 Geneva, Switzerland ("Vanguard").

1. PURPOSE
The parties wish to explore a potential strategic alliance, software co-development, and cross-border API integration in the field of autonomous query optimization (the "Authorized Purpose").

2. CONFIDENTIAL INFORMATION DEFINITION
"Confidential Information" shall mean all non-public, proprietary information, including but not limited to source code, algorithms, customer lists, architectural diagrams, benchmark results, and commercial terms disclosed orally, in writing, or electronically.

3. TERM AND OBLIGATIONS OF NON-DISCLOSURE
(a) Term of Agreement: This Agreement shall remain in full force for a period of three (3) years from the Effective Date, expiring automatically on August 1, 2029.
(b) Survival Period: The obligations of non-disclosure and protection of Trade Secrets shall survive indefinitely, and for all other Confidential Information shall endure for five (5) years following termination.

--- Page 2 of 2: IP RIGHTS, LIABILITY & EXECUTION ---

4. INTELLECTUAL PROPERTY RIGHTS
Neither party transfers any patent, copyright, trademark, or trade secret rights under this Agreement. All pre-existing Intellectual Property remains the sole and exclusive property of the originating party.

5. LIMITATION OF LIABILITY
Neither party's aggregate monetary liability for breach of non-willful disclosure under this Agreement shall exceed USD $2,500,000. Injunctive relief shall be available without posting bond.

6. GOVERNING LAW AND ARBITRATION
This Agreement shall be construed, interpreted, and governed under the laws of the State of New York, United States, without regard to its conflict of laws principles. Any unresolved disputes shall be submitted to binding arbitration before the American Arbitration Association (AAA) in New York, NY.

IN WITNESS WHEREOF, the authorized representatives have executed this Agreement:
For QuantumScale Technologies Inc.: Elena Rostova, Chief Executive Officer
For Vanguard Data Systems S.A.: Marc Dubois, Managing Director`,
    },
    defaultPreset: 'contract',
    description: 'Multi-page cross-border agreement with page-level clauses and signatories',
    badge: 'Legal / 2 Pages',
    defaultData: {
      documentType: 'Mutual Non-Disclosure Agreement',
      summary: 'Two-page bilateral confidentiality and IP agreement between QuantumScale Technologies Inc. and Vanguard Data Systems S.A. across multiple jurisdictions.',
      layoutAnalysis: {
        layoutType: 'multi_page_document',
        totalPages: 2,
        hasDenseTables: false,
        hasHeadersFooters: true,
        hasMultiColumns: false,
      },
      keyFields: [
        { id: 'c-1', key: 'effective_date', label: 'Effective Date', value: '2026-08-01', category: 'Dates', confidence: 'high', verified: true, page: 1 },
        { id: 'c-2', key: 'expiration_date', label: 'Expiration Date', value: '2029-08-01', category: 'Dates', confidence: 'high', verified: true, page: 1 },
        { id: 'c-3', key: 'party_a', label: 'First Party (Party A)', value: 'QuantumScale Technologies Inc.', category: 'Parties', confidence: 'high', page: 1 },
        { id: 'c-4', key: 'party_b', label: 'Second Party (Party B)', value: 'Vanguard Data Systems S.A.', category: 'Parties', confidence: 'high', page: 1 },
        { id: 'c-5', key: 'term_length', label: 'Contract Duration', value: '3 Years', category: 'Terms', confidence: 'high', page: 1 },
        { id: 'c-6', key: 'confidentiality_survival', label: 'Confidentiality Survival', value: '5 Years (Trade Secrets Indefinite)', category: 'Terms', confidence: 'medium', page: 1 },
        { id: 'c-7', key: 'liability_cap', label: 'Liability Limitation Cap', value: '$2,500,000 USD', category: 'Liability', confidence: 'high', page: 2 },
        { id: 'c-8', key: 'governing_law', label: 'Governing Law', value: 'State of New York, USA', category: 'Jurisdiction', confidence: 'high', page: 2 },
        { id: 'c-9', key: 'dispute_forum', label: 'Arbitration Forum', value: 'American Arbitration Association (New York, NY)', category: 'Jurisdiction', confidence: 'high', page: 2 },
        { id: 'c-10', key: 'authorized_purpose', label: 'Purpose of Disclosure', value: 'Strategic alliance & API integration for autonomous query optimization', category: 'General', confidence: 'high', page: 1 },
      ],
      tables: [
        {
          id: 'tbl-signatories',
          title: 'Authorized Signatories',
          headers: ['Entity', 'Representative', 'Title', 'Status', 'Page'],
          rows: [
            ['QuantumScale Technologies Inc.', 'Elena Rostova', 'Chief Executive Officer', 'Signed', 'Page 2'],
            ['Vanguard Data Systems S.A.', 'Marc Dubois', 'Managing Director', 'Signed', 'Page 2'],
          ],
          page: 2,
        },
      ],
      entities: [
        { name: 'QuantumScale Technologies Inc.', type: 'organization', context: 'Delaware Corporation / Disclosing Party', page: 1 },
        { name: 'Vanguard Data Systems S.A.', type: 'organization', context: 'Swiss Corporation / Disclosing Party', page: 1 },
        { name: 'Elena Rostova', type: 'person', context: 'CEO, QuantumScale', page: 2 },
        { name: 'Marc Dubois', type: 'person', context: 'Managing Director, Vanguard', page: 2 },
        { name: 'State of New York', type: 'location', context: 'Jurisdiction / Governing Law', page: 2 },
        { name: '$2,500,000', type: 'amount', context: 'Liability Cap', page: 2 },
      ],
      metadata: {
        detectedLanguage: 'English',
        confidenceScore: 0.98,
        pageCount: 2,
        layoutType: 'multi_page_document',
        processingTimeMs: 760,
        dateExtracted: '2026-09-24T23:50:00Z',
        fileName: 'Master_Services_and_NDA_Agreement.pdf',
        fileType: 'application/pdf',
        fileSizeBytes: 58200,
      },
      rawJson: {
        agreement: {
          title: 'Mutual Non-Disclosure and Intellectual Property Agreement',
          effectiveDate: '2026-08-01',
          expirationDate: '2029-08-01',
          parties: [
            { name: 'QuantumScale Technologies Inc.', jurisdiction: 'Delaware, USA', address: '500 Enterprise Way, Boston, MA' },
            { name: 'Vanguard Data Systems S.A.', jurisdiction: 'Geneva, Switzerland', address: 'Rue du Rhône 42, 1204 Geneva' },
          ],
          liabilityCap: 2500000,
          governingLaw: 'New York',
          arbitration: 'AAA New York',
        },
      },
    },
  },
  {
    item: {
      id: 'sample-resume',
      name: 'Resume_David_Chen_Staff_AI_Engineer.pdf',
      type: 'application/pdf',
      size: 34100,
      isSample: true,
      sampleId: 'sample-resume',
      textContent: `DAVID CHEN, M.S.
San Francisco, CA | (415) 892-0193 | dchen.ai@gmail.com
LinkedIn: linkedin.com/in/davidchen-ai | GitHub: github.com/dchen-models

EXECUTIVE SUMMARY
Staff AI & Distributed Systems Engineer with 8+ years experience scaling LLM training pipelines, retrieval-augmented generation (RAG) architectures, and production inference engines. Author of 3 NeurIPS/ICLR workshop papers. Led teams delivering low-latency inference serving 120M daily queries.

CORE TECHNICAL SKILLS
Languages: Python, Rust, Go, C++, TypeScript, SQL
ML & Frameworks: PyTorch, vLLM, TensorRT-LLM, HuggingFace, Ray, Triton Inference Server
Infra & Cloud: Kubernetes, Slurm, Docker, AWS (SageMaker, EKS), GCP (Vertex AI, GKE)
Databases & Vector: PostgreSQL (pgvector), Milvus, Qdrant, Redis, Apache Kafka

PROFESSIONAL EXPERIENCE

Staff Machine Learning Infrastructure Engineer
HyperScale AI Systems | San Francisco, CA | Jan 2023 - Present
- Architected distributed inference clustering serving 70B parameter models with speculative decoding, slashing P99 latency by 43%.
- Engineered GPU cluster autoscaling over 512x H100 nodes reducing idle compute expenditure by $1.8M annually.
- Mentored a high-performing squad of 7 engineers across inference optimization and quantization.

Senior ML Engineer
Cortex Search Labs | Palo Alto, CA | Jun 2020 - Dec 2022
- Spearheaded hybrid dense-sparse vector search platform indexing 800M multimodal documents with sub-25ms response time.
- Deployed end-to-end continuous fine-tuning pipeline for domain-adapted embeddings.

Machine Learning Engineer
NeuraData Analytics | Seattle, WA | Aug 2018 - May 2020
- Built automated OCR and document structure extraction pipeline processing 15M scanned insurance claims annually with 99.2% accuracy.

EDUCATION
Master of Science in Computer Science (AI Track)
Stanford University, Stanford, CA | 2016 - 2018 | GPA: 3.92/4.0

Bachelor of Science in Electrical Engineering & CS
University of California, Berkeley | 2012 - 2016 | Honors Dean's List`,
    },
    defaultPreset: 'resume',
    description: 'Staff AI Engineer resume with work history, technical stack, and education',
    badge: 'HR / Recruitment',
    defaultData: {
      documentType: 'Professional Resume / CV',
      summary: 'Staff AI & Distributed Systems Engineer with 8+ years experience specializing in LLM inference, GPU cluster orchestration, and RAG architectures.',
      keyFields: [
        { id: 'r-1', key: 'candidate_name', label: 'Full Name', value: 'David Chen, M.S.', category: 'Personal', confidence: 'high', verified: true },
        { id: 'r-2', key: 'current_role', label: 'Current Title', value: 'Staff Machine Learning Infrastructure Engineer', category: 'Personal', confidence: 'high' },
        { id: 'r-3', key: 'email', label: 'Email Address', value: 'dchen.ai@gmail.com', category: 'Personal', confidence: 'high' },
        { id: 'r-4', key: 'phone', label: 'Phone Number', value: '(415) 892-0193', category: 'Personal', confidence: 'high' },
        { id: 'r-5', key: 'location', label: 'Location', value: 'San Francisco, CA', category: 'Personal', confidence: 'high' },
        { id: 'r-6', key: 'years_experience', label: 'Years of Experience', value: '8+ years', category: 'Experience', confidence: 'high' },
        { id: 'r-7', key: 'highest_degree', label: 'Highest Education', value: 'Master of Science in Computer Science (Stanford University)', category: 'Education', confidence: 'high' },
        { id: 'r-8', key: 'gpa', label: 'Graduate GPA', value: '3.92 / 4.0', category: 'Education', confidence: 'medium' },
      ],
      tables: [
        {
          id: 'tbl-experience',
          title: 'Career History',
          headers: ['Role', 'Company', 'Period', 'Location', 'Key Impact'],
          rows: [
            ['Staff ML Infra Engineer', 'HyperScale AI Systems', 'Jan 2023 - Present', 'San Francisco, CA', '70B speculative decoding (-43% P99 latency), $1.8M compute savings on 512x H100'],
            ['Senior ML Engineer', 'Cortex Search Labs', 'Jun 2020 - Dec 2022', 'Palo Alto, CA', 'Indexed 800M multimodal documents with sub-25ms hybrid dense-sparse search'],
            ['Machine Learning Engineer', 'NeuraData Analytics', 'Aug 2018 - May 2020', 'Seattle, WA', 'Automated OCR extraction pipeline for 15M insurance claims (99.2% accuracy)'],
          ],
        },
      ],
      entities: [
        { name: 'David Chen', type: 'person', context: 'Candidate' },
        { name: 'Stanford University', type: 'organization', context: 'M.S. Computer Science Alma Mater' },
        { name: 'UC Berkeley', type: 'organization', context: 'B.S. EECS Alma Mater' },
        { name: 'HyperScale AI Systems', type: 'organization', context: 'Current Employer' },
        { name: 'San Francisco, CA', type: 'location', context: 'Candidate Residence' },
      ],
      metadata: {
        detectedLanguage: 'English',
        confidenceScore: 0.99,
        pageCount: 1,
        processingTimeMs: 690,
        dateExtracted: '2026-09-24T23:50:00Z',
        fileName: 'Resume_David_Chen_Staff_AI_Engineer.pdf',
        fileType: 'application/pdf',
        fileSizeBytes: 34100,
      },
      rawJson: {
        candidate: {
          name: 'David Chen',
          contact: {
            email: 'dchen.ai@gmail.com',
            phone: '(415) 892-0193',
            location: 'San Francisco, CA',
            profiles: ['linkedin.com/in/davidchen-ai', 'github.com/dchen-models'],
          },
          skills: ['Python', 'Rust', 'PyTorch', 'vLLM', 'Kubernetes', 'Ray', 'CUDA'],
          degrees: [
            { degree: 'M.S. Computer Science', school: 'Stanford University', gpa: '3.92' },
            { degree: 'B.S. EECS', school: 'UC Berkeley', honors: "Dean's List" },
          ],
        },
      },
    },
  },
  {
    item: {
      id: 'sample-medical',
      name: 'St_Jude_Medical_Billing_Statement.pdf',
      type: 'application/pdf',
      size: 47900,
      isSample: true,
      sampleId: 'sample-medical',
      textContent: `ST. JUDE REGIONAL HEALTHCARE SYSTEM
DEPARTMENT OF PATIENT ACCOUNTS
420 Healing Way, Medical City, IL 60611
Billing Inquiries: (800) 492-3100 | NPI: 1982736451

PATIENT ENCOUNTER & BILLING STATEMENT

Statement Date: September 10, 2026
Account Number: ACCT-9031849-01
Guarantor Name: Sarah M. Jenkins
Patient Name: Sarah M. Jenkins
Date of Birth: 11/14/1984
Attending Physician: Dr. Robert K. Vance, MD (Cardiology)
Service Facility: St. Jude Heart & Vascular Pavilion

INSURANCE INFORMATION:
Primary Payer: BlueCross BlueShield PPO
Member Policy ID: BCBS-993821049
Group Number: GRP-77218
Claim Status: Adjudicated - In-Network Benefits Applied

ENCOUNTER CHARGES BREAKDOWN:
-----------------------------------------------------------------------------------------------------------------
Date         CPT Code   Service Description                          Charges ($)  Ins. Paid ($)   Patient Due ($)
-----------------------------------------------------------------------------------------------------------------
08/28/2026   99214      Level 4 Comprehensive Outpatient Visit         $380.00       $290.00          $35.00 (Copay)
08/28/2026   93000      12-Lead Electrocardiogram (ECG/EKG)            $195.00       $160.00           $0.00
08/28/2026   93306      Transthoracic Echocardiogram (2D & Doppler)  $1,850.00     $1,420.00         $180.00 (Coinsurance)
08/28/2026   80061      Lipid Panel & Metabolic Biomarker Profile      $140.00       $115.00           $0.00
-----------------------------------------------------------------------------------------------------------------

STATEMENT SUMMARY:
Total Provider Charges: $2,565.00
Contractual Insurance Adjustment: -$580.00
Insurance Payment Received: -$1,770.00
Previous Payments: $0.00
TOTAL PATIENT RESPONSIBILITY: $215.00
Payment Due Date: October 10, 2026

PRIMARY DIAGNOSIS:
ICD-10-CM I10: Essential (primary) hypertension
ICD-10-CM R00.0: Tachycardia, unspecified`,
    },
    defaultPreset: 'medical',
    description: 'Hospital patient billing statement with CPT codes, insurance adjustments, and patient liability',
    badge: 'Healthcare / Medical',
    defaultData: {
      documentType: 'Medical Billing Statement',
      summary: 'Cardiology outpatient visit and diagnostic testing statement for patient Sarah M. Jenkins at St. Jude Regional Healthcare System.',
      keyFields: [
        { id: 'm-1', key: 'statement_date', label: 'Statement Date', value: '2026-09-10', category: 'General', confidence: 'high' },
        { id: 'm-2', key: 'account_number', label: 'Account / Case #', value: 'ACCT-9031849-01', category: 'General', confidence: 'high', verified: true },
        { id: 'm-3', key: 'patient_name', label: 'Patient Name', value: 'Sarah M. Jenkins', category: 'Patient', confidence: 'high', verified: true },
        { id: 'm-4', key: 'patient_dob', label: 'Date of Birth', value: '1984-11-14', category: 'Patient', confidence: 'high' },
        { id: 'm-5', key: 'provider_name', label: 'Healthcare Provider', value: 'St. Jude Regional Healthcare System', category: 'Provider', confidence: 'high' },
        { id: 'm-6', key: 'attending_physician', label: 'Physician', value: 'Dr. Robert K. Vance, MD (Cardiology)', category: 'Provider', confidence: 'high' },
        { id: 'm-7', key: 'insurance_payer', label: 'Primary Insurance', value: 'BlueCross BlueShield PPO', category: 'Insurance', confidence: 'high' },
        { id: 'm-8', key: 'member_id', label: 'Member Policy ID', value: 'BCBS-993821049', category: 'Insurance', confidence: 'high' },
        { id: 'm-9', key: 'total_charges', label: 'Total Billed Charges', value: 2565.00, category: 'Financials', confidence: 'high' },
        { id: 'm-10', key: 'insurance_paid', label: 'Insurance Paid', value: 1770.00, category: 'Financials', confidence: 'high' },
        { id: 'm-11', key: 'patient_due', label: 'Patient Due Balance', value: 215.00, category: 'Financials', confidence: 'high', verified: true },
        { id: 'm-12', key: 'due_date', label: 'Payment Due Date', value: '2026-10-10', category: 'Financials', confidence: 'high' },
      ],
      tables: [
        {
          id: 'tbl-services',
          title: 'Itemized Medical Procedures (CPT Codes)',
          headers: ['Service Date', 'CPT Code', 'Description', 'Charges ($)', 'Insurance Paid ($)', 'Patient Due ($)'],
          rows: [
            ['08/28/2026', '99214', 'Level 4 Comprehensive Outpatient Visit', '$380.00', '$290.00', '$35.00 (Copay)'],
            ['08/28/2026', '93000', '12-Lead Electrocardiogram (ECG/EKG)', '$195.00', '$160.00', '$0.00'],
            ['08/28/2026', '93306', 'Transthoracic Echocardiogram (2D & Doppler)', '$1,850.00', '$1,420.00', '$180.00 (Coinsurance)'],
            ['08/28/2026', '80061', 'Lipid Panel & Metabolic Biomarker Profile', '$140.00', '$115.00', '$0.00'],
          ],
        },
      ],
      entities: [
        { name: 'Sarah M. Jenkins', type: 'person', context: 'Patient & Guarantor' },
        { name: 'Dr. Robert K. Vance, MD', type: 'person', context: 'Attending Cardiologist' },
        { name: 'St. Jude Regional Healthcare System', type: 'organization', context: 'Hospital Facility' },
        { name: 'BlueCross BlueShield', type: 'organization', context: 'Primary Health Insurer' },
        { name: '$215.00', type: 'amount', context: 'Patient Out-of-Pocket Balance' },
        { name: 'ICD-10 I10 & R00.0', type: 'identifier', context: 'Diagnosis Codes' },
      ],
      metadata: {
        detectedLanguage: 'English',
        confidenceScore: 0.98,
        pageCount: 1,
        processingTimeMs: 710,
        dateExtracted: '2026-09-24T23:50:00Z',
        fileName: 'St_Jude_Medical_Billing_Statement.pdf',
        fileType: 'application/pdf',
        fileSizeBytes: 47900,
      },
      rawJson: {
        statement: {
          accountNumber: 'ACCT-9031849-01',
          statementDate: '2026-09-10',
          dueDate: '2026-10-10',
          patient: {
            name: 'Sarah M. Jenkins',
            dob: '1984-11-14',
          },
          facility: 'St. Jude Heart & Vascular Pavilion',
          financials: {
            totalBilled: 2565.00,
            insuranceAdjustment: 580.00,
            insurancePaid: 1770.00,
            patientResponsibility: 215.00,
          },
          diagnosis: ['I10 Essential Hypertension', 'R00.0 Tachycardia'],
        },
      },
    },
  },
];
