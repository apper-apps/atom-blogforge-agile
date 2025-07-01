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

export const getAllMedia = async () => {
  await delay(300)
  try {
    const apperClient = getApperClient()
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "type" } },
        { field: { Name: "size" } },
        { field: { Name: "url" } },
        { field: { Name: "alt" } },
        { field: { Name: "uploaded_at" } },
        { field: { Name: "updated_at" } }
      ],
      orderBy: [{ fieldName: "uploaded_at", sorttype: "DESC" }]
    }
    
    const response = await apperClient.fetchRecords("media", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      return []
    }
    
    return response.data || []
  } catch (error) {
    console.error("Error fetching media:", error)
    toast.error("Failed to fetch media")
    return []
  }
}

export const getMediaById = async (id) => {
  await delay(200)
  try {
    const apperClient = getApperClient()
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "type" } },
        { field: { Name: "size" } },
        { field: { Name: "url" } },
        { field: { Name: "alt" } },
        { field: { Name: "uploaded_at" } },
        { field: { Name: "updated_at" } }
      ]
    }
    
    const response = await apperClient.getRecordById("media", parseInt(id), params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      throw new Error('Media not found')
    }
    
    return response.data
  } catch (error) {
    console.error("Error fetching media by ID:", error)
    throw new Error('Media not found')
  }
}

export const uploadMedia = async (file) => {
  await delay(800) // Simulate upload time
  
  // Validate file
  if (!file) throw new Error('No file provided')
  if (file.size > 10 * 1024 * 1024) throw new Error('File too large')
  
  try {
    const apperClient = getApperClient()
    
    // Only include Updateable fields
    const params = {
      records: [{
        Name: file.name,
        Tags: '',
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file), // In real app, this would be uploaded to cloud storage
        alt: '',
        uploaded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]
    }
    
    const response = await apperClient.createRecord("media", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      throw new Error('Failed to upload media')
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
      
      const uploadedMedia = successfulRecords[0]?.data
      if (uploadedMedia) {
        toast.success('Media uploaded successfully')
        return uploadedMedia
      }
    }
    
    throw new Error('Failed to upload media')
  } catch (error) {
    console.error("Error uploading media:", error)
    throw error
  }
}

export const updateMedia = async (id, updateData) => {
  await delay(300)
  try {
    const apperClient = getApperClient()
    
    // Only include Updateable fields plus Id
    const params = {
      records: [{
        Id: parseInt(id),
        Name: updateData.Name || updateData.name,
        Tags: updateData.Tags || '',
        type: updateData.type,
        size: updateData.size,
        url: updateData.url,
        alt: updateData.alt,
        uploaded_at: updateData.uploaded_at,
        updated_at: new Date().toISOString()
      }]
    }
    
    const response = await apperClient.updateRecord("media", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      throw new Error('Failed to update media')
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
      
      const updatedMedia = successfulUpdates[0]?.data
      if (updatedMedia) {
        toast.success('Media updated successfully')
        return updatedMedia
      }
    }
    
    throw new Error('Failed to update media')
  } catch (error) {
    console.error("Error updating media:", error)
    throw error
  }
}

export const deleteMedia = async (id) => {
  await delay(300)
  try {
    // Get media first to revoke URL if it's a blob
    const media = await getMediaById(id)
    if (media && media.url && media.url.startsWith('blob:')) {
      URL.revokeObjectURL(media.url)
    }
    
    const apperClient = getApperClient()
    const params = {
      RecordIds: [parseInt(id)]
    }
    
    const response = await apperClient.deleteRecord("media", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      throw new Error('Failed to delete media')
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
        toast.success('Media deleted successfully')
        return true
      }
    }
    
    throw new Error('Failed to delete media')
  } catch (error) {
    console.error("Error deleting media:", error)
    throw error
  }
}

export const getMediaByType = async (type) => {
  await delay(300)
  try {
    const apperClient = getApperClient()
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "type" } },
        { field: { Name: "size" } },
        { field: { Name: "url" } },
        { field: { Name: "alt" } },
        { field: { Name: "uploaded_at" } },
        { field: { Name: "updated_at" } }
      ],
      where: [{ FieldName: "type", Operator: "StartsWith", Values: [type] }],
      orderBy: [{ fieldName: "uploaded_at", sorttype: "DESC" }]
    }
    
    const response = await apperClient.fetchRecords("media", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      return []
    }
    
    return response.data || []
  } catch (error) {
    console.error("Error fetching media by type:", error)
    toast.error("Failed to fetch media by type")
    return []
  }
}

export const searchMedia = async (query) => {
  await delay(300)
  try {
    const apperClient = getApperClient()
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "type" } },
        { field: { Name: "size" } },
        { field: { Name: "url" } },
        { field: { Name: "alt" } },
        { field: { Name: "uploaded_at" } },
        { field: { Name: "updated_at" } }
      ],
      whereGroups: [{
        operator: "OR",
        subGroups: [{
          operator: "OR",
          conditions: [
            { fieldName: "Name", operator: "Contains", values: [query], include: true },
            { fieldName: "alt", operator: "Contains", values: [query], include: true }
          ]
        }]
      }],
      orderBy: [{ fieldName: "uploaded_at", sorttype: "DESC" }]
    }
    
    const response = await apperClient.fetchRecords("media", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      return []
    }
    
    return response.data || []
  } catch (error) {
    console.error("Error searching media:", error)
    toast.error("Failed to search media")
    return []
  }
}