import { posts } from '@/services/mockData/posts'
import { authors } from '@/services/mockData/authors'
import { updateSitemap } from '@/services/api/sitemapService'

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Semantic linking configuration
const LINKING_CONFIG = {
  maxLinksPerPost: 5,
  similarityThreshold: 0.3,
  maxAnchorLength: 50
}

// Similarity calculations cache
let similarityCache = new Map()

// Helper function to get post with author and semantic links
const getPostWithAuthor = (post) => {
  const author = authors.find(a => a.Id === post.authorId)
  return { ...post, author }
}

// Simple term extraction for compatibility
const extractTerms = (content) => {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'])
  
  return content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))
}

// Simple similarity calculation without external NLP
const calculateSimilarity = (post1, post2) => {
  const cacheKey = `${post1.Id}-${post2.Id}`
  if (similarityCache.has(cacheKey)) {
    return similarityCache.get(cacheKey)
  }
  
  const text1 = `${post1.title} ${post1.content} ${post1.keywords.join(' ')}`
  const text2 = `${post2.title} ${post2.content} ${post2.keywords.join(' ')}`
  
  const terms1 = extractTerms(text1)
  const terms2 = extractTerms(text2)
  
  // Calculate Jaccard similarity for keywords
  const keywords1 = new Set(post1.keywords.map(k => k.toLowerCase()))
  const keywords2 = new Set(post2.keywords.map(k => k.toLowerCase()))
  const intersection = new Set([...keywords1].filter(k => keywords2.has(k)))
  const union = new Set([...keywords1, ...keywords2])
  const keywordSimilarity = intersection.size / Math.max(union.size, 1)
  
  // Calculate term overlap
  const terms1Set = new Set(terms1)
  const terms2Set = new Set(terms2)
  const termIntersection = new Set([...terms1Set].filter(t => terms2Set.has(t)))
  const termUnion = new Set([...terms1Set, ...terms2Set])
  const termSimilarity = termIntersection.size / Math.max(termUnion.size, 1)
  
  // Category bonus
  const categoryBonus = post1.category === post2.category ? 0.1 : 0
  
  // Weighted combination
  const similarity = (keywordSimilarity * 0.6) + (termSimilarity * 0.4) + categoryBonus
  similarityCache.set(cacheKey, similarity)
  
  return similarity
}

// Simple semantic link generation
const generateSemanticLinks = (content, currentPostId, relatedPosts) => {
  let linkedContent = content
  let linkCount = 0
  const usedTerms = new Set()
  
  relatedPosts.forEach(relatedPost => {
    if (linkCount >= LINKING_CONFIG.maxLinksPerPost) return
    
    // Look for title words
    const titleWords = relatedPost.title.toLowerCase().split(/\s+/)
      .filter(word => word.length >= 4)
    
    titleWords.forEach(word => {
      if (linkCount >= LINKING_CONFIG.maxLinksPerPost) return
      if (usedTerms.has(word)) return
      
      const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      
      if (linkedContent.match(regex) && !linkedContent.includes(`>${word}<`)) {
        const link = `<a href="/post/${relatedPost.slug}" class="semantic-link text-primary-600 dark:text-primary-400 hover:underline">${word}</a>`
        linkedContent = linkedContent.replace(regex, link)
        usedTerms.add(word)
        linkCount++
      }
    })
    
    // Look for keywords
    relatedPost.keywords.forEach(keyword => {
      if (linkCount >= LINKING_CONFIG.maxLinksPerPost) return
      if (usedTerms.has(keyword.toLowerCase())) return
      
      const keywordLower = keyword.toLowerCase()
      const regex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      
      if (linkedContent.match(regex) && !linkedContent.includes(`>${keyword}<`)) {
        const link = `<a href="/post/${relatedPost.slug}" class="semantic-link text-primary-600 dark:text-primary-400 hover:underline">${keyword}</a>`
        linkedContent = linkedContent.replace(regex, link)
        usedTerms.add(keywordLower)
        linkCount++
      }
    })
  })
  
  return linkedContent
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
  
  const postWithAuthor = getPostWithAuthor(post)
  
// Generate semantic links if post is published
  if (post.status === 'published') {
    try {
      const relatedPosts = await getRelatedPosts(post.Id, 5)
      
      // Use local semantic linking to avoid circular dependency
      postWithAuthor.contentWithLinks = generateSemanticLinks(post.content, post.Id, relatedPosts)
      
      // Add semantic metadata
      postWithAuthor.semanticStats = {
        linksGenerated: (postWithAuthor.contentWithLinks.match(/semantic-link/g) || []).length,
        relatedPostsAnalyzed: relatedPosts.length,
        averageSimilarity: relatedPosts.reduce((sum, p) => sum + (p.similarityScore || 0), 0) / Math.max(relatedPosts.length, 1)
      }
    } catch (error) {
      console.warn('Semantic linking failed:', error)
      postWithAuthor.contentWithLinks = post.content
      postWithAuthor.semanticStats = { linksGenerated: 0, relatedPostsAnalyzed: 0, averageSimilarity: 0 }
    }
  }
  
  return postWithAuthor
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
  
  // Get all published posts except current
  const candidates = posts.filter(post => 
    post.Id !== postId && post.status === 'published'
  )
  
  // Calculate semantic similarity scores
  const scoredPosts = candidates.map(post => ({
    ...post,
    similarityScore: calculateSimilarity(currentPost, post)
  }))
  
  // Sort by similarity score and filter by threshold
  return scoredPosts
    .filter(post => post.similarityScore >= LINKING_CONFIG.similarityThreshold)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit)
    .map(post => getPostWithAuthor(post))
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