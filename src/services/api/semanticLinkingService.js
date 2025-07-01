import { posts } from '@/services/mockData/posts'
import natural from 'natural'

// Configuration for semantic linking
const CONFIG = {
  maxLinksPerPost: 5,
  similarityThreshold: 0.3,
  maxAnchorLength: 50,
  minWordLength: 4
}

// TF-IDF instance for text analysis
const tfidf = new natural.TfIdf()
let isInitialized = false

// Initialize TF-IDF with all posts
const initializeTfIdf = () => {
  if (isInitialized) return
  
  posts.forEach(post => {
    const text = `${post.title} ${post.content} ${post.keywords.join(' ')}`
    tfidf.addDocument(preprocessText(text))
  })
  isInitialized = true
}

// Preprocess text for analysis
const preprocessText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Extract meaningful terms from text
const extractTerms = (text) => {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'this', 'that', 'these', 'those', 'can', 'may',
    'must', 'shall', 'might', 'ought', 'from', 'into', 'during', 'before', 'after',
    'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further',
    'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
    'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
    'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now'
  ])
  
  return preprocessText(text)
    .split(/\s+/)
    .filter(word => 
      word.length >= CONFIG.minWordLength && 
      !stopWords.has(word) &&
      /^[a-z]+$/.test(word)
    )
}

// Calculate semantic similarity between two posts
export const calculatePostSimilarity = (post1, post2) => {
  initializeTfIdf()
  
  // Combine title, content, and keywords for analysis
  const text1 = `${post1.title} ${post1.content} ${post1.keywords.join(' ')}`
  const text2 = `${post2.title} ${post2.content} ${post2.keywords.join(' ')}`
  
  const terms1 = extractTerms(text1)
  const terms2 = extractTerms(text2)
  
  // Calculate keyword overlap (Jaccard similarity)
  const keywords1 = new Set(post1.keywords.map(k => k.toLowerCase()))
  const keywords2 = new Set(post2.keywords.map(k => k.toLowerCase()))
  const keywordIntersection = new Set([...keywords1].filter(k => keywords2.has(k)))
  const keywordUnion = new Set([...keywords1, ...keywords2])
  const keywordSimilarity = keywordIntersection.size / Math.max(keywordUnion.size, 1)
  
  // Calculate term overlap
  const terms1Set = new Set(terms1)
  const terms2Set = new Set(terms2)
  const termIntersection = new Set([...terms1Set].filter(t => terms2Set.has(t)))
  const termUnion = new Set([...terms1Set, ...terms2Set])
  const termSimilarity = termIntersection.size / Math.max(termUnion.size, 1)
  
  // Calculate cosine similarity using TF-IDF vectors
  const vector1 = {}
  const vector2 = {}
  const allTerms = new Set([...terms1, ...terms2])
  
  allTerms.forEach(term => {
    vector1[term] = terms1.filter(t => t === term).length / terms1.length
    vector2[term] = terms2.filter(t => t === term).length / terms2.length
  })
  
  const dotProduct = Object.keys(vector1).reduce((sum, term) => {
    return sum + (vector1[term] || 0) * (vector2[term] || 0)
  }, 0)
  
  const magnitude1 = Math.sqrt(Object.values(vector1).reduce((sum, val) => sum + val * val, 0))
  const magnitude2 = Math.sqrt(Object.values(vector2).reduce((sum, val) => sum + val * val, 0))
  
  const cosineSimilarity = magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0
  
  // Weighted combination of different similarity measures
  return (keywordSimilarity * 0.5) + (termSimilarity * 0.3) + (cosineSimilarity * 0.2)
}

// Find anchor text opportunities in content
const findAnchorOpportunities = (content, targetPost) => {
  const opportunities = []
  
  // Look for title words
  const titleWords = targetPost.title.toLowerCase().split(/\s+/)
    .filter(word => word.length >= CONFIG.minWordLength)
  
  titleWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    let match
    while ((match = regex.exec(content)) !== null) {
      opportunities.push({
        term: word,
        position: match.index,
        type: 'title',
        score: 0.8
      })
    }
  })
  
  // Look for keywords
  targetPost.keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi')
    let match
    while ((match = regex.exec(content)) !== null) {
      opportunities.push({
        term: keyword,
        position: match.index,
        type: 'keyword',
        score: 0.9
      })
    }
  })
  
  // Sort by score and position
  return opportunities
    .sort((a, b) => b.score - a.score || a.position - b.position)
    .slice(0, 2) // Limit opportunities per post
}

// Generate semantic links within content
export const generateSemanticLinks = (content, currentPostId, relatedPosts) => {
  if (!content || !relatedPosts.length) return content
  
  let linkedContent = content
  let linkCount = 0
  const usedTerms = new Set()
  
  // Sort related posts by similarity score (if available)
  const sortedPosts = relatedPosts.sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0))
  
  sortedPosts.forEach(relatedPost => {
    if (linkCount >= CONFIG.maxLinksPerPost) return
    
    const opportunities = findAnchorOpportunities(linkedContent, relatedPost)
    
    opportunities.forEach(opportunity => {
      if (linkCount >= CONFIG.maxLinksPerPost) return
      if (usedTerms.has(opportunity.term.toLowerCase())) return
      
      const regex = new RegExp(`\\b${opportunity.term}\\b`, 'i')
      
      // Check if this term is not already linked
      if (!linkedContent.includes(`>${opportunity.term}<`) && regex.test(linkedContent)) {
        const replacement = `<a href="/post/${relatedPost.slug}" class="semantic-link text-primary-600 dark:text-primary-400 hover:underline transition-colors" title="Read: ${relatedPost.title}">${opportunity.term}</a>`
        linkedContent = linkedContent.replace(regex, replacement)
        usedTerms.add(opportunity.term.toLowerCase())
        linkCount++
      }
    })
  })
  
  return linkedContent
}

// Analyze content for semantic linking opportunities
export const analyzeContentForLinks = async (content, currentPostId) => {
  const publishedPosts = posts.filter(post => 
    post.Id !== currentPostId && post.status === 'published'
  )
  
  if (!publishedPosts.length) return { content, suggestions: [] }
  
  const currentPost = posts.find(p => p.Id === currentPostId)
  if (!currentPost) return { content, suggestions: [] }
  
  // Calculate similarities
  const scoredPosts = publishedPosts.map(post => ({
    ...post,
    similarityScore: calculatePostSimilarity(currentPost, post)
  }))
  
  // Filter by threshold and get top candidates
  const candidates = scoredPosts
    .filter(post => post.similarityScore >= CONFIG.similarityThreshold)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, CONFIG.maxLinksPerPost)
  
  // Generate links
  const contentWithLinks = generateSemanticLinks(content, currentPostId, candidates)
  
  return {
    content: contentWithLinks,
    suggestions: candidates.map(post => ({
      postId: post.Id,
      title: post.title,
      slug: post.slug,
      similarityScore: post.similarityScore,
      keywords: post.keywords
    }))
  }
}

// Get semantic linking statistics
export const getLinkingStats = (postId) => {
  const post = posts.find(p => p.Id === postId)
  if (!post) return null
  
  const publishedPosts = posts.filter(p => 
    p.Id !== postId && p.status === 'published'
  )
  
  const similarities = publishedPosts.map(p => ({
    postId: p.Id,
    title: p.title,
    similarity: calculatePostSimilarity(post, p)
  }))
  
  const strongConnections = similarities.filter(s => s.similarity >= CONFIG.similarityThreshold)
  
  return {
    totalPosts: publishedPosts.length,
    strongConnections: strongConnections.length,
    averageSimilarity: similarities.reduce((sum, s) => sum + s.similarity, 0) / similarities.length,
    topConnections: strongConnections
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
  }
}

export default {
  calculatePostSimilarity,
  generateSemanticLinks,
  analyzeContentForLinks,
  getLinkingStats
}