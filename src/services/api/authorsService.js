import { authors } from '@/services/mockData/authors'

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const getAllAuthors = async () => {
  await delay(300)
  return [...authors]
}

export const getAuthorById = async (id) => {
  await delay(300)
  const author = authors.find(a => a.Id === id)
  if (!author) throw new Error('Author not found')
  return { ...author }
}

export const createAuthor = async (authorData) => {
  await delay(400)
  const newId = Math.max(...authors.map(a => a.Id)) + 1
  const newAuthor = {
    ...authorData,
    Id: newId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  authors.push(newAuthor)
  return { ...newAuthor }
}

export const updateAuthor = async (id, authorData) => {
  await delay(400)
  const index = authors.findIndex(a => a.Id === id)
  if (index === -1) throw new Error('Author not found')
  
  authors[index] = {
    ...authors[index],
    ...authorData,
    Id: id,
    updatedAt: new Date().toISOString()
  }
  return { ...authors[index] }
}

export const deleteAuthor = async (id) => {
  await delay(300)
  const index = authors.findIndex(a => a.Id === id)
  if (index === -1) throw new Error('Author not found')
  
  authors.splice(index, 1)
  return true
}