import { updateSitemap } from '@/services/api/sitemapService'
import { generateRSSFeed } from '@/services/api/rssService'
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

// Semantic linking configuration
const LINKING_CONFIG = {
  maxLinksPerPost: 5,
  similarityThreshold: 0.3,
  maxAnchorLength: 50
}

// Similarity calculations cache
let similarityCache = new Map()

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
  
  const text1 = `${post1.title} ${post1.content} ${post1.keywords?.join(' ') || ''}`
  const text2 = `${post2.title} ${post2.content} ${post2.keywords?.join(' ') || ''}`
  
  const terms1 = extractTerms(text1)
  const terms2 = extractTerms(text2)
  
  // Calculate Jaccard similarity for keywords
  const keywords1 = new Set((post1.keywords || []).map(k => k.toLowerCase()))
  const keywords2 = new Set((post2.keywords || []).map(k => k.toLowerCase()))
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
    (relatedPost.keywords || []).forEach(keyword => {
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
  try {
    const apperClient = getApperClient()
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "author_id" }, referenceField: { field: { Name: "Name" } } },
        { field: { Name: "tenant_id" } },
        { field: { Name: "title" } },
        { field: { Name: "slug" } },
        { field: { Name: "content" } },
        { field: { Name: "excerpt" } },
        { field: { Name: "featured_image" } },
        { field: { Name: "meta_title" } },
        { field: { Name: "meta_description" } },
        { field: { Name: "keywords" } },
        { field: { Name: "category" } },
        { field: { Name: "status" } },
        { field: { Name: "views" } },
        { field: { Name: "scheduled_publish_at" } },
        { field: { Name: "published_at" } },
        { field: { Name: "created_at" } },
        { field: { Name: "updated_at" } },
        { field: { Name: "content_with_links" } }
      ],
      orderBy: [{ fieldName: "created_at", sorttype: "DESC" }]
    }
    
    const response = await apperClient.fetchRecords("post", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      return []
    }
    
    return response.data || []
  } catch (error) {
    console.error("Error fetching posts:", error)
    toast.error("Failed to fetch posts")
    return []
  }
}

export const getPublishedPosts = async () => {
  await delay(300)
  try {
    const apperClient = getApperClient()
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "author_id" }, referenceField: { field: { Name: "Name" } } },
        { field: { Name: "tenant_id" } },
        { field: { Name: "title" } },
        { field: { Name: "slug" } },
        { field: { Name: "content" } },
        { field: { Name: "excerpt" } },
        { field: { Name: "featured_image" } },
        { field: { Name: "meta_title" } },
        { field: { Name: "meta_description" } },
        { field: { Name: "keywords" } },
        { field: { Name: "category" } },
        { field: { Name: "status" } },
        { field: { Name: "views" } },
        { field: { Name: "scheduled_publish_at" } },
        { field: { Name: "published_at" } },
        { field: { Name: "created_at" } },
        { field: { Name: "updated_at" } },
        { field: { Name: "content_with_links" } }
      ],
      where: [{ FieldName: "status", Operator: "EqualTo", Values: ["published"] }],
      orderBy: [{ fieldName: "published_at", sorttype: "DESC" }]
    }
    
    const response = await apperClient.fetchRecords("post", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      return []
    }
    
    return response.data || []
  } catch (error) {
    console.error("Error fetching published posts:", error)
    toast.error("Failed to fetch published posts")
    return []
  }
}

export const getPostsByCategory = async (category, limit = 5) => {
  await delay(300)
  try {
    const apperClient = getApperClient()
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "author_id" }, referenceField: { field: { Name: "Name" } } },
        { field: { Name: "tenant_id" } },
        { field: { Name: "title" } },
        { field: { Name: "slug" } },
        { field: { Name: "content" } },
        { field: { Name: "excerpt" } },
        { field: { Name: "featured_image" } },
        { field: { Name: "meta_title" } },
        { field: { Name: "meta_description" } },
        { field: { Name: "keywords" } },
        { field: { Name: "category" } },
        { field: { Name: "status" } },
        { field: { Name: "views" } },
        { field: { Name: "scheduled_publish_at" } },
        { field: { Name: "published_at" } },
        { field: { Name: "created_at" } },
        { field: { Name: "updated_at" } },
        { field: { Name: "content_with_links" } }
      ],
      where: [
        { FieldName: "status", Operator: "EqualTo", Values: ["published"] },
        { FieldName: "category", Operator: "EqualTo", Values: [category] }
      ],
      orderBy: [{ fieldName: "published_at", sorttype: "DESC" }],
      pagingInfo: { limit: limit, offset: 0 }
    }
    
    const response = await apperClient.fetchRecords("post", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      return []
    }
    
    return response.data || []
  } catch (error) {
    console.error("Error fetching posts by category:", error)
    toast.error("Failed to fetch posts by category")
    return []
  }
}

export const getRecentPosts = async (limit = 5) => {
  await delay(200)
  try {
    const apperClient = getApperClient()
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "author_id" }, referenceField: { field: { Name: "Name" } } },
        { field: { Name: "tenant_id" } },
        { field: { Name: "title" } },
        { field: { Name: "slug" } },
        { field: { Name: "content" } },
        { field: { Name: "excerpt" } },
        { field: { Name: "featured_image" } },
        { field: { Name: "meta_title" } },
        { field: { Name: "meta_description" } },
        { field: { Name: "keywords" } },
        { field: { Name: "category" } },
        { field: { Name: "status" } },
        { field: { Name: "views" } },
        { field: { Name: "scheduled_publish_at" } },
        { field: { Name: "published_at" } },
        { field: { Name: "created_at" } },
        { field: { Name: "updated_at" } },
        { field: { Name: "content_with_links" } }
      ],
      orderBy: [{ fieldName: "created_at", sorttype: "DESC" }],
      pagingInfo: { limit: limit, offset: 0 }
    }
    
    const response = await apperClient.fetchRecords("post", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      return []
    }
    
    return response.data || []
  } catch (error) {
    console.error("Error fetching recent posts:", error)
    toast.error("Failed to fetch recent posts")
    return []
  }
}

export const getScheduledPosts = async () => {
  await delay(300)
  try {
    const apperClient = getApperClient()
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "author_id" }, referenceField: { field: { Name: "Name" } } },
        { field: { Name: "tenant_id" } },
        { field: { Name: "title" } },
        { field: { Name: "slug" } },
        { field: { Name: "content" } },
        { field: { Name: "excerpt" } },
        { field: { Name: "featured_image" } },
        { field: { Name: "meta_title" } },
        { field: { Name: "meta_description" } },
        { field: { Name: "keywords" } },
        { field: { Name: "category" } },
        { field: { Name: "status" } },
        { field: { Name: "views" } },
        { field: { Name: "scheduled_publish_at" } },
        { field: { Name: "published_at" } },
        { field: { Name: "created_at" } },
        { field: { Name: "updated_at" } },
        { field: { Name: "content_with_links" } }
      ],
      where: [{ FieldName: "status", Operator: "EqualTo", Values: ["scheduled"] }],
      orderBy: [{ fieldName: "scheduled_publish_at", sorttype: "ASC" }]
    }
    
    const response = await apperClient.fetchRecords("post", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      return []
    }
    
    return response.data || []
  } catch (error) {
    console.error("Error fetching scheduled posts:", error)
    toast.error("Failed to fetch scheduled posts")
    return []
  }
}

export const getPostById = async (id) => {
  await delay(300)
  try {
    const apperClient = getApperClient()
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "author_id" }, referenceField: { field: { Name: "Name" } } },
        { field: { Name: "tenant_id" } },
        { field: { Name: "title" } },
        { field: { Name: "slug" } },
        { field: { Name: "content" } },
        { field: { Name: "excerpt" } },
        { field: { Name: "featured_image" } },
        { field: { Name: "meta_title" } },
        { field: { Name: "meta_description" } },
        { field: { Name: "keywords" } },
        { field: { Name: "category" } },
        { field: { Name: "status" } },
        { field: { Name: "views" } },
        { field: { Name: "scheduled_publish_at" } },
        { field: { Name: "published_at" } },
        { field: { Name: "created_at" } },
        { field: { Name: "updated_at" } },
        { field: { Name: "content_with_links" } }
      ]
    }
    
    const response = await apperClient.getRecordById("post", parseInt(id), params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      throw new Error('Post not found')
    }
    
    return response.data
  } catch (error) {
    console.error("Error fetching post by ID:", error)
    throw new Error('Post not found')
  }
}

export const getPostBySlug = async (slug) => {
  await delay(300)
  try {
    const apperClient = getApperClient()
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "author_id" }, referenceField: { field: { Name: "Name" } } },
        { field: { Name: "tenant_id" } },
        { field: { Name: "title" } },
        { field: { Name: "slug" } },
        { field: { Name: "content" } },
        { field: { Name: "excerpt" } },
        { field: { Name: "featured_image" } },
        { field: { Name: "meta_title" } },
        { field: { Name: "meta_description" } },
        { field: { Name: "keywords" } },
        { field: { Name: "category" } },
        { field: { Name: "status" } },
        { field: { Name: "views" } },
        { field: { Name: "scheduled_publish_at" } },
        { field: { Name: "published_at" } },
        { field: { Name: "created_at" } },
        { field: { Name: "updated_at" } },
        { field: { Name: "content_with_links" } }
      ],
      where: [{ FieldName: "slug", Operator: "EqualTo", Values: [slug] }]
    }
    
    const response = await apperClient.fetchRecords("post", params)
    
    if (!response.success || !response.data || response.data.length === 0) {
      throw new Error('Post not found')
    }
    
    const post = response.data[0]
    
    // Generate semantic links if post is published
    if (post.status === 'published') {
      try {
        const relatedPosts = await getRelatedPosts(post.Id, 5)
        
        // Use local semantic linking to avoid circular dependency
        post.content_with_links = generateSemanticLinks(post.content, post.Id, relatedPosts)
        
        // Add semantic metadata
        post.semanticStats = {
          linksGenerated: (post.content_with_links.match(/semantic-link/g) || []).length,
          relatedPostsAnalyzed: relatedPosts.length,
          averageSimilarity: relatedPosts.reduce((sum, p) => sum + (p.similarityScore || 0), 0) / Math.max(relatedPosts.length, 1)
        }
      } catch (error) {
        console.warn('Semantic linking failed:', error)
        post.content_with_links = post.content
        post.semanticStats = { linksGenerated: 0, relatedPostsAnalyzed: 0, averageSimilarity: 0 }
      }
    }
    
    return post
  } catch (error) {
    console.error("Error fetching post by slug:", error)
    throw new Error('Post not found')
  }
}

export const getPostsByAuthor = async (authorId) => {
  await delay(300)
  try {
    const apperClient = getApperClient()
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "author_id" }, referenceField: { field: { Name: "Name" } } },
        { field: { Name: "tenant_id" } },
        { field: { Name: "title" } },
        { field: { Name: "slug" } },
        { field: { Name: "content" } },
        { field: { Name: "excerpt" } },
        { field: { Name: "featured_image" } },
        { field: { Name: "meta_title" } },
        { field: { Name: "meta_description" } },
        { field: { Name: "keywords" } },
        { field: { Name: "category" } },
        { field: { Name: "status" } },
        { field: { Name: "views" } },
        { field: { Name: "scheduled_publish_at" } },
        { field: { Name: "published_at" } },
        { field: { Name: "created_at" } },
        { field: { Name: "updated_at" } },
        { field: { Name: "content_with_links" } }
      ],
      where: [
        { FieldName: "author_id", Operator: "EqualTo", Values: [parseInt(authorId)] },
        { FieldName: "status", Operator: "EqualTo", Values: ["published"] }
      ],
      orderBy: [{ fieldName: "published_at", sorttype: "DESC" }]
    }
    
    const response = await apperClient.fetchRecords("post", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      return []
    }
    
    return response.data || []
  } catch (error) {
    console.error("Error fetching posts by author:", error)
    toast.error("Failed to fetch posts by author")
    return []
  }
}

export const getRelatedPosts = async (postId, limit = 3) => {
  await delay(300)
  try {
    const currentPost = await getPostById(postId)
    if (!currentPost) return []
    
    const apperClient = getApperClient()
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "author_id" }, referenceField: { field: { Name: "Name" } } },
        { field: { Name: "tenant_id" } },
        { field: { Name: "title" } },
        { field: { Name: "slug" } },
        { field: { Name: "content" } },
        { field: { Name: "excerpt" } },
        { field: { Name: "featured_image" } },
        { field: { Name: "meta_title" } },
        { field: { Name: "meta_description" } },
        { field: { Name: "keywords" } },
        { field: { Name: "category" } },
        { field: { Name: "status" } },
        { field: { Name: "views" } },
        { field: { Name: "scheduled_publish_at" } },
        { field: { Name: "published_at" } },
        { field: { Name: "created_at" } },
        { field: { Name: "updated_at" } },
        { field: { Name: "content_with_links" } }
      ],
      where: [{ FieldName: "status", Operator: "EqualTo", Values: ["published"] }]
    }
    
    const response = await apperClient.fetchRecords("post", params)
    
    if (!response.success) {
      console.error(response.message)
      return []
    }
    
    const candidates = (response.data || []).filter(post => post.Id !== postId)
    
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
  } catch (error) {
    console.error("Error fetching related posts:", error)
    return []
  }
}

export const createPost = async (postData) => {
  await delay(400)
  try {
    const apperClient = getApperClient()
    
    // Only include Updateable fields
    const params = {
      records: [{
        Name: postData.Name || postData.title,
        Tags: postData.Tags || postData.keywords?.join(',') || '',
        author_id: parseInt(postData.author_id || postData.authorId),
        tenant_id: postData.tenant_id || 'demo-tenant',
        title: postData.title,
        slug: postData.slug,
        content: postData.content,
        excerpt: postData.excerpt,
        featured_image: postData.featured_image || postData.featuredImage,
        meta_title: postData.meta_title || postData.metaTitle,
        meta_description: postData.meta_description || postData.metaDescription,
        keywords: Array.isArray(postData.keywords) ? postData.keywords.join(',') : postData.keywords,
        category: postData.category,
        status: postData.status,
        views: postData.views || 0,
        scheduled_publish_at: postData.scheduled_publish_at || postData.scheduledPublishAt,
        published_at: postData.published_at || postData.publishedAt,
        created_at: postData.created_at || new Date().toISOString(),
        updated_at: postData.updated_at || new Date().toISOString(),
        content_with_links: postData.content_with_links || postData.content
      }]
    }
    
    const response = await apperClient.createRecord("post", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      throw new Error('Failed to create post')
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
      
      const createdPost = successfulRecords[0]?.data
      if (createdPost) {
        toast.success('Post created successfully')
        
        // Update sitemap and RSS feed if post is published
        if (createdPost.status === 'published') {
          try {
            await updateSitemap()
            await generateRSSFeed()
          } catch (error) {
            console.warn('Failed to update sitemap/RSS:', error)
          }
        }
        
        return createdPost
      }
    }
    
    throw new Error('Failed to create post')
  } catch (error) {
    console.error("Error creating post:", error)
    throw error
  }
}

export const updatePost = async (id, postData) => {
  await delay(400)
  try {
    const apperClient = getApperClient()
    
    // Only include Updateable fields plus Id
    const params = {
      records: [{
        Id: parseInt(id),
        Name: postData.Name || postData.title,
        Tags: postData.Tags || postData.keywords?.join(',') || '',
        author_id: parseInt(postData.author_id || postData.authorId),
        tenant_id: postData.tenant_id || 'demo-tenant',
        title: postData.title,
        slug: postData.slug,
        content: postData.content,
        excerpt: postData.excerpt,
        featured_image: postData.featured_image || postData.featuredImage,
        meta_title: postData.meta_title || postData.metaTitle,
        meta_description: postData.meta_description || postData.metaDescription,
        keywords: Array.isArray(postData.keywords) ? postData.keywords.join(',') : postData.keywords,
        category: postData.category,
        status: postData.status,
        views: postData.views,
        scheduled_publish_at: postData.scheduled_publish_at || postData.scheduledPublishAt,
        published_at: postData.published_at || postData.publishedAt,
        created_at: postData.created_at,
        updated_at: new Date().toISOString(),
        content_with_links: postData.content_with_links || postData.content
      }]
    }
    
    const response = await apperClient.updateRecord("post", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      throw new Error('Failed to update post')
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
      
      const updatedPost = successfulUpdates[0]?.data
      if (updatedPost) {
        toast.success('Post updated successfully')
        
        // Update sitemap and RSS feed
        try {
          await updateSitemap()
          await generateRSSFeed()
        } catch (error) {
          console.warn('Failed to update sitemap/RSS:', error)
        }
        
        return updatedPost
      }
    }
    
    throw new Error('Failed to update post')
  } catch (error) {
    console.error("Error updating post:", error)
    throw error
  }
}

export const deletePost = async (id) => {
  await delay(300)
  try {
    const apperClient = getApperClient()
    const params = {
      RecordIds: [parseInt(id)]
    }
    
    const response = await apperClient.deleteRecord("post", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      throw new Error('Failed to delete post')
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
        toast.success('Post deleted successfully')
        
        // Update sitemap and RSS feed
        try {
          await updateSitemap()
          await generateRSSFeed()
        } catch (error) {
          console.warn('Failed to update sitemap/RSS:', error)
        }
        
        return true
      }
    }
    
    throw new Error('Failed to delete post')
  } catch (error) {
    console.error("Error deleting post:", error)
    throw error
  }
}

export const schedulePost = async (id, scheduledDate) => {
  await delay(300)
  try {
    const updateData = {
      status: 'scheduled',
      scheduled_publish_at: scheduledDate,
      updated_at: new Date().toISOString()
    }
    
    const updatedPost = await updatePost(id, updateData)
    toast.success('Post scheduled successfully')
    return updatedPost
  } catch (error) {
    console.error("Error scheduling post:", error)
    throw error
  }
}

export const updateScheduledPost = async (id, newDate) => {
  await delay(300)
  try {
    const updateData = {
      scheduled_publish_at: newDate,
      updated_at: new Date().toISOString()
    }
    
    const updatedPost = await updatePost(id, updateData)
    toast.success('Scheduled post updated successfully')
    return updatedPost
  } catch (error) {
    console.error("Error updating scheduled post:", error)
    throw error
  }
}

export const incrementPostViews = async (id) => {
  await delay(100)
  try {
    const post = await getPostById(id)
    if (post) {
      const updateData = {
        views: (post.views || 0) + 1
      }
      await updatePost(id, updateData)
      return updateData.views
    }
    return 0
  } catch (error) {
    console.error("Error incrementing post views:", error)
    return 0
  }
}