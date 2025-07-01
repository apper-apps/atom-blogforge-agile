import { toast } from 'react-toastify'

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  })
}

// Get all templates
export const getAllTemplates = async () => {
  await delay(300)
  try {
    const apperClient = getApperClient()
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "description" } },
        { field: { Name: "category" } },
        { field: { Name: "content" } },
        { field: { Name: "excerpt" } },
        { field: { Name: "keywords" } },
        { field: { Name: "meta_title" } },
        { field: { Name: "meta_description" } },
        { field: { Name: "created_at" } },
        { field: { Name: "updated_at" } },
        { field: { Name: "usage_count" } },
        { field: { Name: "last_used_at" } }
      ],
      orderBy: [{ fieldName: "Name", sorttype: "ASC" }]
    }
    
    const response = await apperClient.fetchRecords("template", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      return []
    }
    
    return response.data || []
  } catch (error) {
    console.error("Error fetching templates:", error)
    toast.error("Failed to fetch templates")
    return []
  }
}

// Get template by ID
export const getTemplateById = async (id) => {
  await delay(200)
  try {
    const apperClient = getApperClient()
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "description" } },
        { field: { Name: "category" } },
        { field: { Name: "content" } },
        { field: { Name: "excerpt" } },
        { field: { Name: "keywords" } },
        { field: { Name: "meta_title" } },
        { field: { Name: "meta_description" } },
        { field: { Name: "created_at" } },
        { field: { Name: "updated_at" } },
        { field: { Name: "usage_count" } },
        { field: { Name: "last_used_at" } }
      ]
    }
    
    const response = await apperClient.getRecordById("template", parseInt(id), params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      throw new Error('Template not found')
    }
    
    return response.data
  } catch (error) {
    console.error("Error fetching template by ID:", error)
    throw new Error('Template not found')
  }
}

// Create new template
export const createTemplate = async (templateData) => {
  await delay(400)
  try {
    const apperClient = getApperClient()
    
    // Only include Updateable fields
    const params = {
      records: [{
        Name: templateData.Name || templateData.name,
        Tags: templateData.Tags || '',
        description: templateData.description,
        category: templateData.category,
        content: templateData.content,
        excerpt: templateData.excerpt,
        keywords: Array.isArray(templateData.keywords) ? templateData.keywords.join(',') : templateData.keywords,
        meta_title: templateData.meta_title || templateData.metaTitle,
        meta_description: templateData.meta_description || templateData.metaDescription,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0,
        last_used_at: null
      }]
    }
    
    const response = await apperClient.createRecord("template", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      throw new Error('Failed to create template')
    }
    
    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success)
      const failedRecords = response.results.filter(result => !result.success)
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`)
          })
          if (record.message) toast.error(record.message)
        })
      }
      
      const createdTemplate = successfulRecords[0]?.data
      if (createdTemplate) {
        toast.success('Template created successfully')
        return createdTemplate
      }
    }
    
    throw new Error('Failed to create template')
  } catch (error) {
    console.error("Error creating template:", error)
    throw error
  }
}

// Update template
export const updateTemplate = async (id, templateData) => {
  await delay(400)
  try {
    const apperClient = getApperClient()
    
    // Only include Updateable fields plus Id
    const params = {
      records: [{
        Id: parseInt(id),
        Name: templateData.Name || templateData.name,
        Tags: templateData.Tags || '',
        description: templateData.description,
        category: templateData.category,
        content: templateData.content,
        excerpt: templateData.excerpt,
        keywords: Array.isArray(templateData.keywords) ? templateData.keywords.join(',') : templateData.keywords,
        meta_title: templateData.meta_title || templateData.metaTitle,
        meta_description: templateData.meta_description || templateData.metaDescription,
        created_at: templateData.created_at,
        updated_at: new Date().toISOString(),
        usage_count: templateData.usage_count,
        last_used_at: templateData.last_used_at
      }]
    }
    
    const response = await apperClient.updateRecord("template", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      throw new Error('Failed to update template')
    }
    
    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success)
      const failedUpdates = response.results.filter(result => !result.success)
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`)
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`)
          })
          if (record.message) toast.error(record.message)
        })
      }
      
      const updatedTemplate = successfulUpdates[0]?.data
      if (updatedTemplate) {
        toast.success('Template updated successfully')
        return updatedTemplate
      }
    }
    
    throw new Error('Failed to update template')
  } catch (error) {
    console.error("Error updating template:", error)
    throw error
  }
}

// Delete template
export const deleteTemplate = async (id) => {
  await delay(300)
  try {
    const apperClient = getApperClient()
    const params = {
      RecordIds: [parseInt(id)]
    }
    
    const response = await apperClient.deleteRecord("template", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      throw new Error('Failed to delete template')
    }
    
    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success)
      const failedDeletions = response.results.filter(result => !result.success)
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`)
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message)
        })
      }
      
      if (successfulDeletions.length > 0) {
        toast.success('Template deleted successfully')
        return true
      }
    }
    
    throw new Error('Failed to delete template')
  } catch (error) {
    console.error("Error deleting template:", error)
    throw error
  }
}

// Increment usage count
export const incrementTemplateUsage = async (id) => {
  await delay(200)
  try {
    const template = await getTemplateById(id)
    if (template) {
      const updateData = {
        usage_count: (template.usage_count || 0) + 1,
        last_used_at: new Date().toISOString()
      }
      return await updateTemplate(id, updateData)
    }
    return null
  } catch (error) {
    console.error("Error incrementing template usage:", error)
    return null
  }
}