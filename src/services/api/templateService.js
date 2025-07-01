import mockTemplates from '@/services/mockData/templates'

let templates = [...mockTemplates]

// Helper to get next ID
const getNextId = () => {
  return templates.length > 0 ? Math.max(...templates.map(t => t.Id)) + 1 : 1
}

// Get all templates
export const getAllTemplates = async () => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return [...templates]
}

// Get template by ID
export const getTemplateById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200))
  const template = templates.find(t => t.Id === parseInt(id))
  if (!template) {
    throw new Error('Template not found')
  }
  return { ...template }
}

// Create new template
export const createTemplate = async (templateData) => {
  await new Promise(resolve => setTimeout(resolve, 400))
  
  const newTemplate = {
    ...templateData,
    Id: getNextId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0
  }
  
  templates.push(newTemplate)
  return { ...newTemplate }
}

// Update template
export const updateTemplate = async (id, templateData) => {
  await new Promise(resolve => setTimeout(resolve, 400))
  
  const index = templates.findIndex(t => t.Id === parseInt(id))
  if (index === -1) {
    throw new Error('Template not found')
  }
  
  const updatedTemplate = {
    ...templates[index],
    ...templateData,
    Id: templates[index].Id, // Preserve ID
    updatedAt: new Date().toISOString()
  }
  
  templates[index] = updatedTemplate
  return { ...updatedTemplate }
}

// Delete template
export const deleteTemplate = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const index = templates.findIndex(t => t.Id === parseInt(id))
  if (index === -1) {
    throw new Error('Template not found')
  }
  
  templates.splice(index, 1)
  return true
}

// Increment usage count
export const incrementTemplateUsage = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200))
  
  const index = templates.findIndex(t => t.Id === parseInt(id))
  if (index !== -1) {
    templates[index].usageCount = (templates[index].usageCount || 0) + 1
    templates[index].lastUsedAt = new Date().toISOString()
    return { ...templates[index] }
  }
  return null
}