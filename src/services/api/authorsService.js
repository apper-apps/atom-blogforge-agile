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

export const getAllAuthors = async () => {
  await delay(300)
  try {
    const apperClient = getApperClient()
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "tenant_id" } },
        { field: { Name: "email" } },
        { field: { Name: "avatar" } },
        { field: { Name: "bio" } },
        { field: { Name: "designation" } },
        { field: { Name: "social_links" } },
        { field: { Name: "created_at" } },
        { field: { Name: "updated_at" } }
      ],
      orderBy: [{ fieldName: "Name", sorttype: "ASC" }]
    }
    
    const response = await apperClient.fetchRecords("author", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      return []
    }
    
    return response.data || []
  } catch (error) {
    console.error("Error fetching authors:", error)
    toast.error("Failed to fetch authors")
    return []
  }
}

export const getAuthorById = async (id) => {
  await delay(300)
  try {
    const apperClient = getApperClient()
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "tenant_id" } },
        { field: { Name: "email" } },
        { field: { Name: "avatar" } },
        { field: { Name: "bio" } },
        { field: { Name: "designation" } },
        { field: { Name: "social_links" } },
        { field: { Name: "created_at" } },
        { field: { Name: "updated_at" } }
      ]
    }
    
    const response = await apperClient.getRecordById("author", parseInt(id), params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      throw new Error('Author not found')
    }
    
    return response.data
  } catch (error) {
    console.error("Error fetching author by ID:", error)
    throw new Error('Author not found')
  }
}

export const createAuthor = async (authorData) => {
  await delay(400)
  try {
    const apperClient = getApperClient()
    
    // Only include Updateable fields
    const params = {
      records: [{
        Name: authorData.Name || authorData.name,
        Tags: authorData.Tags || '',
        tenant_id: authorData.tenant_id || 'demo-tenant',
        email: authorData.email,
        avatar: authorData.avatar,
        bio: authorData.bio,
        designation: authorData.designation,
        social_links: typeof authorData.social_links === 'object' 
          ? JSON.stringify(authorData.social_links) 
          : authorData.social_links,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]
    }
    
    const response = await apperClient.createRecord("author", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      throw new Error('Failed to create author')
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
      
      const createdAuthor = successfulRecords[0]?.data
      if (createdAuthor) {
        toast.success('Author created successfully')
        return createdAuthor
      }
    }
    
    throw new Error('Failed to create author')
  } catch (error) {
    console.error("Error creating author:", error)
    throw error
  }
}

export const updateAuthor = async (id, authorData) => {
  await delay(400)
  try {
    const apperClient = getApperClient()
    
    // Only include Updateable fields plus Id
    const params = {
      records: [{
        Id: parseInt(id),
        Name: authorData.Name || authorData.name,
        Tags: authorData.Tags || '',
        tenant_id: authorData.tenant_id || 'demo-tenant',
        email: authorData.email,
        avatar: authorData.avatar,
        bio: authorData.bio,
        designation: authorData.designation,
        social_links: typeof authorData.social_links === 'object' 
          ? JSON.stringify(authorData.social_links) 
          : authorData.social_links,
        created_at: authorData.created_at,
        updated_at: new Date().toISOString()
      }]
    }
    
    const response = await apperClient.updateRecord("author", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      throw new Error('Failed to update author')
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
      
      const updatedAuthor = successfulUpdates[0]?.data
      if (updatedAuthor) {
        toast.success('Author updated successfully')
        return updatedAuthor
      }
    }
    
    throw new Error('Failed to update author')
  } catch (error) {
    console.error("Error updating author:", error)
    throw error
  }
}

export const deleteAuthor = async (id) => {
  await delay(300)
  try {
    const apperClient = getApperClient()
    const params = {
      RecordIds: [parseInt(id)]
    }
    
    const response = await apperClient.deleteRecord("author", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      throw new Error('Failed to delete author')
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
        toast.success('Author deleted successfully')
        return true
      }
    }
    
    throw new Error('Failed to delete author')
  } catch (error) {
    console.error("Error deleting author:", error)
    throw error
  }
}