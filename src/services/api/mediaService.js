import mediaData from '@/services/mockData/media'

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Generate unique ID
const generateId = () => {
  const existingIds = mediaData.map(item => item.Id)
  return existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1
}

export const getAllMedia = async () => {
  await delay(300)
  return [...mediaData].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
}

export const getMediaById = async (id) => {
  await delay(200)
  const media = mediaData.find(item => item.Id === id)
  if (!media) throw new Error('Media not found')
  return { ...media }
}

export const uploadMedia = async (file) => {
  await delay(800) // Simulate upload time
  
  // Validate file
  if (!file) throw new Error('No file provided')
  if (file.size > 10 * 1024 * 1024) throw new Error('File too large')
  
  // Create media object
  const newMedia = {
    Id: generateId(),
    name: file.name,
    type: file.type,
    size: file.size,
    url: URL.createObjectURL(file), // In real app, this would be uploaded to cloud storage
    alt: '',
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mediaData.push(newMedia)
  return { ...newMedia }
}

export const updateMedia = async (id, updateData) => {
  await delay(300)
  const index = mediaData.findIndex(item => item.Id === id)
  if (index === -1) throw new Error('Media not found')
  
  mediaData[index] = {
    ...mediaData[index],
    ...updateData,
    Id: id, // Ensure ID doesn't change
    updatedAt: new Date().toISOString()
  }
  
  return { ...mediaData[index] }
}

export const deleteMedia = async (id) => {
  await delay(300)
  const index = mediaData.findIndex(item => item.Id === id)
  if (index === -1) throw new Error('Media not found')
  
  // Revoke object URL to free memory
  const media = mediaData[index]
  if (media.url.startsWith('blob:')) {
    URL.revokeObjectURL(media.url)
  }
  
  mediaData.splice(index, 1)
  return true
}

export const getMediaByType = async (type) => {
  await delay(300)
  return mediaData
    .filter(item => item.type.startsWith(type))
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
}

export const searchMedia = async (query) => {
  await delay(300)
  const lowercaseQuery = query.toLowerCase()
  return mediaData
    .filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.alt?.toLowerCase().includes(lowercaseQuery)
    )
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
}