'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  GripVertical,
  Eye,
  ArrowLeft
} from 'lucide-react'

interface TemplateField {
  name: string
  label: string
  type: 'text' | 'select' | 'multiselect' | 'date' | 'number' | 'textarea'
  required: boolean
  options?: string[]
}

interface Template {
  id: string
  name: string
  type: string
  fields: string
  created_at: string
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown (Single)' },
  { value: 'multiselect', label: 'Dropdown (Multiple)' },
]

export default function TemplateBuilderPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [fields, setFields] = useState<TemplateField[]>([])
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/institution/templates', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewTemplate = () => {
    setEditingTemplate(null)
    setTemplateName('')
    setFields([
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'procedure_type', label: 'Procedure Type', type: 'text', required: true },
    ])
  }

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template)
    setTemplateName(template.name)
    try {
      const parsed = typeof template.fields === 'string' ? JSON.parse(template.fields) : template.fields
      setFields(parsed)
    } catch {
      setFields([])
    }
  }

  const addField = () => {
    setFields([
      ...fields,
      { name: `field_${fields.length + 1}`, label: 'New Field', type: 'text', required: false }
    ])
  }

  const updateField = (index: number, updates: Partial<TemplateField>) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...updates }
    setFields(newFields)
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const saveTemplate = async () => {
    if (!templateName.trim() || fields.length === 0) {
      alert('Please provide a template name and at least one field')
      return
    }

    setSaving(true)
    try {
      const url = editingTemplate ? '/api/institution/templates' : '/api/institution/templates'
      const method = editingTemplate ? 'PUT' : 'POST'
      
      const body: any = {
        name: templateName,
        fields
      }
      
      if (editingTemplate) {
        body.id = editingTemplate.id
      }

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        await fetchTemplates()
        setEditingTemplate(null)
        setTemplateName('')
        setFields([])
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to save template')
      }
    } catch (error) {
      console.error('Failed to save template:', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return
    
    try {
      const response = await fetch(`/api/institution/templates?id=${id}`, { method: 'DELETE', credentials: 'include' })
      if (response.ok) {
        await fetchTemplates()
      }
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/institution/admin" className="p-2 text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Custom Templates</h1>
            <p className="text-gray-600">Create custom case entry templates for your institution</p>
          </div>
        </div>
        <button
          onClick={handleNewTemplate}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Existing Templates</h2>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : templates.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No custom templates yet. Create your first template.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {templates.map((template) => {
                const parsedFields = typeof template.fields === 'string' ? JSON.parse(template.fields) : template.fields
                return (
                  <div key={template.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-gray-900">{template.name}</p>
                      <p className="text-sm text-gray-500">{parsedFields?.length || 0} fields • {template.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Template Editor */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h2>
              {fields.length > 0 && (
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  {showPreview ? 'Hide Preview' : 'Preview'}
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Template Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Cardiac Surgery Template"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Fields */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Fields
                </label>
                <button
                  onClick={addField}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Field
                </button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <GripVertical className="h-5 w-5 text-gray-400 mt-1 cursor-move" />
                    
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Field Name</label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateField(index, { name: e.target.value })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Label</label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Type</label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(index, { type: e.target.value as any })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                        >
                          {FIELD_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs text-gray-600 mt-4">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(index, { required: e.target.checked })}
                            className="rounded border-gray-300"
                          />
                          Required
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={() => removeField(index)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {fields.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  No fields added yet. Click "Add Field" to start building your template.
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => { setEditingTemplate(null); setTemplateName(''); setFields([]) }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveTemplate}
                disabled={saving || !templateName.trim() || fields.length === 0}
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Template Preview</h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {fields.map((field, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <option>Select {field.label}</option>
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" rows={3} />
                  ) : field.type === 'date' ? (
                    <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                  ) : field.type === 'number' ? (
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                  ) : (
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
