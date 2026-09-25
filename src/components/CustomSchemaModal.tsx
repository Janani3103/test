import React, { useState } from 'react';
import { X, Plus, Trash2, Settings2, Sparkles, Check, HelpCircle } from 'lucide-react';
import { CustomSchemaConfig, CustomFieldDef } from '../types/extraction';

interface CustomSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CustomSchemaConfig;
  onSave: (config: CustomSchemaConfig) => void;
}

export const CustomSchemaModal: React.FC<CustomSchemaModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [name, setName] = useState(config.name || 'My Custom Schema');
  const [description, setDescription] = useState(config.description || 'Target fields for extraction');
  const [fields, setFields] = useState<CustomFieldDef[]>(config.fields || []);
  const [includeTables, setIncludeTables] = useState(config.includeTables ?? true);
  const [customPromptRules, setCustomPromptRules] = useState(config.customPromptRules || '');

  if (!isOpen) return null;

  const handleAddField = () => {
    const newField: CustomFieldDef = {
      id: `def-${Date.now()}`,
      key: `field_${fields.length + 1}`,
      label: `Custom Field ${fields.length + 1}`,
      type: 'string',
      description: '',
      required: false,
    };
    setFields([...fields, newField]);
  };

  const handleUpdateField = (id: string, updates: Partial<CustomFieldDef>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleDeleteField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      fields,
      includeTables,
      customPromptRules,
    });
    onClose();
  };

  // Quick load template
  const handleLoadTemplate = (type: 'tax' | 'logistics' | 'real_estate') => {
    if (type === 'tax') {
      setName('Tax & W-2 Statement Schema');
      setDescription('Extracts W-2 earnings, employer EIN, withheld taxes');
      setFields([
        { id: '1', key: 'employer_ein', label: 'Employer EIN', type: 'string', description: 'XX-XXXXXXX format' },
        { id: '2', key: 'wages_tips_compensation', label: 'Wages & Tips (Box 1)', type: 'currency', description: 'Gross compensation' },
        { id: '3', key: 'fed_income_tax_withheld', label: 'Federal Income Tax (Box 2)', type: 'currency', description: 'Federal tax withheld' },
        { id: '4', key: 'ss_wages', label: 'Social Security Wages (Box 3)', type: 'currency', description: 'Social security wage base' },
        { id: '5', key: 'employee_ssn', label: 'Employee SSN / ID', type: 'string', description: 'Masked employee identification' },
      ]);
      setCustomPromptRules('Format all currency figures as floating point numbers with 2 decimal places.');
    } else if (type === 'logistics') {
      setName('Bill of Lading / Shipping Schema');
      setDescription('Extracts freight carrier, BOL number, shipping weights and consignee');
      setFields([
        { id: '1', key: 'bol_number', label: 'Bill of Lading #', type: 'string', description: 'Unique freight BOL number' },
        { id: '2', key: 'carrier_scac', label: 'Carrier SCAC Code', type: 'string', description: 'Standard Carrier Alpha Code' },
        { id: '3', key: 'shipper_address', label: 'Origin Shipper Address', type: 'string', description: 'Pickup facility address' },
        { id: '4', key: 'consignee_address', label: 'Delivery Consignee', type: 'string', description: 'Destination delivery party' },
        { id: '5', key: 'gross_weight_lbs', label: 'Gross Weight (lbs)', type: 'number', description: 'Total cargo weight in pounds' },
      ]);
      setCustomPromptRules('Extract trailer numbers and seal numbers into the description if present.');
    } else if (type === 'real_estate') {
      setName('Commercial Lease Agreement Schema');
      setDescription('Extracts landlord, tenant, premises square footage, and base rent');
      setFields([
        { id: '1', key: 'landlord_name', label: 'Landlord / Lessor', type: 'string', description: 'Owner or property management company' },
        { id: '2', key: 'tenant_name', label: 'Tenant / Lessee', type: 'string', description: 'Leasing tenant entity' },
        { id: '3', key: 'premises_address', label: 'Leased Premises', type: 'string', description: 'Suite number and full street address' },
        { id: '4', key: 'monthly_base_rent', label: 'Monthly Base Rent', type: 'currency', description: 'Monthly base rental amount' },
        { id: '5', key: 'security_deposit', label: 'Security Deposit', type: 'currency', description: 'Required deposit amount' },
        { id: '6', key: 'lease_commencement', label: 'Commencement Date', type: 'date', description: 'Lease start date YYYY-MM-DD' },
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Custom Extraction Schema Builder</h3>
              <p className="text-xs text-slate-400">Define the exact structured keys and types you want AI to extract.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Templates */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Start with a schema template:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleLoadTemplate('tax')}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
              >
                💼 Tax & W-2 Forms
              </button>
              <button
                type="button"
                onClick={() => handleLoadTemplate('logistics')}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
              >
                🚚 Bill of Lading / Freight
              </button>
              <button
                type="button"
                onClick={() => handleLoadTemplate('real_estate')}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
              >
                🏢 Commercial Lease
              </button>
            </div>
          </div>

          <form id="custom-schema-form" onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Schema Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Purchase Order Extraction"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description / Purpose
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Extracts line items and delivery terms"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Target Fields List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Target Fields to Extract ({fields.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddField}
                  className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Field</span>
                </button>
              </div>

              {fields.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  No custom fields defined yet. Click "Add Field" or load a template above.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-2"
                    >
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => {
                          const newLabel = e.target.value;
                          const autoKey = newLabel.toLowerCase().replace(/[^a-z0-9_]/g, '_');
                          handleUpdateField(field.id, { label: newLabel, key: autoKey });
                        }}
                        placeholder="Field Label (e.g. Due Date)"
                        className="w-full sm:w-1/3 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                        required
                      />

                      <input
                        type="text"
                        value={field.key}
                        onChange={(e) => handleUpdateField(field.id, { key: e.target.value })}
                        placeholder="JSON Key (e.g. due_date)"
                        className="w-full sm:w-1/4 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-indigo-300"
                        required
                      />

                      <select
                        value={field.type}
                        onChange={(e) => handleUpdateField(field.id, { type: e.target.value as any })}
                        className="w-full sm:w-28 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200"
                      >
                        <option value="string">Text</option>
                        <option value="number">Number</option>
                        <option value="currency">Currency</option>
                        <option value="date">Date</option>
                        <option value="boolean">Boolean</option>
                      </select>

                      <input
                        type="text"
                        value={field.description}
                        onChange={(e) => handleUpdateField(field.id, { description: e.target.value })}
                        placeholder="Extraction note or prompt hint"
                        className="w-full sm:flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-300 placeholder-slate-600"
                      />

                      <button
                        type="button"
                        onClick={() => handleDeleteField(field.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                        title="Delete field"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom AI Prompt Directives */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Custom AI Directives / Formatting Rules
              </label>
              <textarea
                value={customPromptRules}
                onChange={(e) => setCustomPromptRules(e.target.value)}
                rows={3}
                placeholder="e.g. Standardize all dates to ISO 8601 (YYYY-MM-DD). If an address contains a suite number, include it on a second line."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Include Tables Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeTables"
                checked={includeTables}
                onChange={(e) => setIncludeTables(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 focus:ring-indigo-500"
              />
              <label htmlFor="includeTables" className="text-xs text-slate-300 cursor-pointer">
                Automatically detect and extract recurring itemized line-item tables
              </label>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="custom-schema-form"
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Custom Schema</span>
          </button>
        </div>
      </div>
    </div>
  );
};
