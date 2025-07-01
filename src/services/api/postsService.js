import { posts } from '@/services/mockData/posts'
import { authors } from '@/services/mockData/authors'
import { updateSitemap } from '@/services/api/sitemapService'

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function to get post with author
const getPostWithAuthor = (post) => {
  const author = authors.find(a => a.Id === post.authorId)
  return { ...post, author }
}

export const getAllPosts = async () => {
  await delay(300)
  return posts.map(getPostWithAuthor).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export const getPublishedPosts = async () => {
  await delay(300)
  return posts
    .filter(post => post.status === 'published')
    .map(getPostWithAuthor)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
}
export const getRecentPosts = async (limit = 5) => {
  await delay(200)
  return posts
    .map(getPostWithAuthor)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
}

export const getScheduledPosts = async () => {
  await delay(300)
  return posts
    .filter(post => post.status === 'scheduled' && post.scheduledPublishAt)
    .map(getPostWithAuthor)
    .sort((a, b) => new Date(a.scheduledPublishAt) - new Date(b.scheduledPublishAt))
}

export const getPostById = async (id) => {
  await delay(300)
  const post = posts.find(p => p.Id === id)
  if (!post) throw new Error('Post not found')
  return getPostWithAuthor(post)
}

export const getPostBySlug = async (slug) => {
  await delay(300)
  const post = posts.find(p => p.slug === slug)
  if (!post) throw new Error('Post not found')
  return getPostWithAuthor(post)
}

export const getPostsByAuthor = async (authorId) => {
  await delay(300)
  return posts
    .filter(post => post.authorId === authorId && post.status === 'published')
    .map(getPostWithAuthor)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
}

export const getRelatedPosts = async (postId, limit = 3) => {
  await delay(300)
  const currentPost = posts.find(p => p.Id === postId)
  if (!currentPost) return []
  
  return posts
    .filter(post => 
      post.Id !== postId && 
      post.status === 'published' &&
      post.keywords.some(keyword => currentPost.keywords.includes(keyword))
    )
    .map(getPostWithAuthor)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, limit)
}

export const createPost = async (postData) => {
  await delay(400)
  const newId = Math.max(...posts.map(p => p.Id)) + 1
  const newPost = {
    ...postData,
    Id: newId,
    views: 0,
    scheduledPublishAt: postData.scheduledPublishAt || null,
    createdAt: new Date().toISOString(),
updatedAt: new Date().toISOString()
  }
  posts.push(newPost)
  
  // Update sitemap if post is published
  if (newPost.status === 'published') {
    try {
      await updateSitemap()
    } catch (error) {
      console.warn('Failed to update sitemap:', error)
    }
  }
  
  return getPostWithAuthor(newPost)
}
export const updatePost = async (id, postData) => {
  await delay(400)
  const index = posts.findIndex(p => p.Id === id)
  if (index === -1) throw new Error('Post not found')
  
  posts[index] = {
    ...posts[index],
    ...postData,
Id: id,
    scheduledPublishAt: postData.scheduledPublishAt || posts[index].scheduledPublishAt,
    updatedAt: new Date().toISOString()
  }
  
  // Update sitemap if publish status changed
  const oldStatus = posts[index].status
  const newStatus = posts[index].status
  if (oldStatus !== newStatus && (newStatus === 'published' || oldStatus === 'published')) {
    try {
      await updateSitemap()
    } catch (error) {
      console.warn('Failed to update sitemap:', error)
    }
  }
  
  return getPostWithAuthor(posts[index])
}
export const deletePost = async (id) => {
  await delay(300)
  const index = posts.findIndex(p => p.Id === id)
if (index === -1) throw new Error('Post not found')
  
  const deletedPost = posts[index]
  posts.splice(index, 1)
  
  // Update sitemap if published post was deleted
  if (deletedPost.status === 'published') {
    try {
      await updateSitemap()
    } catch (error) {
      console.warn('Failed to update sitemap:', error)
    }
  }
  
  return true
}
export const schedulePost = async (id, scheduledDate) => {
  await delay(300)
  const index = posts.findIndex(p => p.Id === id)
  if (index === -1) throw new Error('Post not found')
  
  posts[index] = {
    ...posts[index],
    status: 'scheduled',
    scheduledPublishAt: scheduledDate,
scheduledPublishAt: scheduledDate,
    updatedAt: new Date().toISOString()
  }
  
  // Update sitemap when post is scheduled (removing from published if it was)
  try {
    await updateSitemap()
  } catch (error) {
    console.warn('Failed to update sitemap:', error)
  }
  
  return getPostWithAuthor(posts[index])
}
export const updateScheduledPost = async (id, newDate) => {
  await delay(300)
  const index = posts.findIndex(p => p.Id === id)
  if (index === -1) throw new Error('Post not found')
  
  posts[index] = {
    ...posts[index],
scheduledPublishAt: newDate,
    updatedAt: new Date().toISOString()
  }
  
  // Update sitemap for scheduled post changes
  try {
    await updateSitemap()
  } catch (error) {
    console.warn('Failed to update sitemap:', error)
  }
  
  return getPostWithAuthor(posts[index])
}
export const incrementPostViews = async (id) => {
  await delay(100)
  const post = posts.find(p => p.Id === id)
  if (post) {
    post.views += 1
  }
  return post?.views || 0
}