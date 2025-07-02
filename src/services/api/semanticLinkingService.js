import { getAllPosts } from '@/services/api/postsService'
import nlp from 'compromise'

// Configuration for semantic linking
const CONFIG = {
  maxLinksPerPost: 5,
  similarityThreshold: 0.25,
  maxAnchorLength: 50,
  minWordLength: 4,
  contextWindowSize: 20,
  similarityWeights: {
    keyword: 0.4,
    term: 0.35,
    cosine: 0.25
  }
}
// Initialize cache for processed posts
let processedPosts = new Map()
let isInitialized = false
// Initialize NLP analysis cache
const initializeNlpCache = async () => {
  if (isInitialized) return
  const posts = await getAllPosts()
  posts.forEach(post => {
    const text = `${post.title} ${post.content} ${post.keywords.join(' ')}`
    const doc = nlp(preprocessText(text))
    processedPosts.set(post.Id, {
      terms: doc.terms().out('array'),
      nouns: doc.nouns().out('array'),
      topics: doc.topics().out('array')
    })
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

// Extract meaningful terms using compromise NLP
const extractTerms = (text) => {
  const doc = nlp(preprocessText(text))
  
  // Get meaningful terms
  const terms = doc.terms()
    .filter(term => term.text.length >= CONFIG.minWordLength)
    .out('array')
  
  // Get noun phrases
  const nouns = doc.nouns().out('array')
  
  // Get important topics
  const topics = doc.topics().out('array')
  
  // Extract 2-3 word phrases
  const phrases = []
  const sentences = doc.sentences().out('array')
  
  sentences.forEach(sentence => {
    const sentenceDoc = nlp(sentence)
    const chunks = sentenceDoc.chunks().out('array')
    chunks.forEach(chunk => {
      const words = chunk.split(' ')
      if (words.length >= 2 && words.length <= 3) {
        const filteredWords = words.filter(word => word.length >= CONFIG.minWordLength)
        if (filteredWords.length === words.length) {
          phrases.push(chunk)
        }
      }
    })
  })
  
  return [...new Set([...terms, ...nouns, ...topics, ...phrases])]
}

// Calculate semantic similarity between two posts
export const calculatePostSimilarity = async (post1, post2) => {
  await initializeNlpCache()
  
  // Combine title, content, and keywords for analysis
  const text1 = `${post1.title} ${post1.content} ${post1.keywords.join(' ')}`
  const text2 = `${post2.title} ${post2.content} ${post2.keywords.join(' ')}`
  
  // Use compromise for analysis
  const doc1 = nlp(preprocessText(text1))
  const doc2 = nlp(preprocessText(text2))
  
  const terms1 = doc1.terms().out('array')
  const terms2 = doc2.terms().out('array')
  const nouns1 = doc1.nouns().out('array')
  const nouns2 = doc2.nouns().out('array')
  
  // Calculate keyword overlap (Jaccard similarity)
  const keywords1 = new Set(post1.keywords.map(k => k.toLowerCase()))
  const keywords2 = new Set(post2.keywords.map(k => k.toLowerCase()))
  const keywordIntersection = new Set([...keywords1].filter(k => keywords2.has(k)))
  const keywordUnion = new Set([...keywords1, ...keywords2])
  const keywordSimilarity = keywordIntersection.size / Math.max(keywordUnion.size, 1)
  
  // Calculate term overlap
  const terms1Set = new Set(terms1.map(t => t.toLowerCase()))
  const terms2Set = new Set(terms2.map(t => t.toLowerCase()))
  const termIntersection = new Set([...terms1Set].filter(t => terms2Set.has(t)))
  const termUnion = new Set([...terms1Set, ...terms2Set])
  const termSimilarity = termIntersection.size / Math.max(termUnion.size, 1)
  
  // Calculate noun overlap
  const nouns1Set = new Set(nouns1.map(n => n.toLowerCase()))
  const nouns2Set = new Set(nouns2.map(n => n.toLowerCase()))
  const nounIntersection = new Set([...nouns1Set].filter(n => nouns2Set.has(n)))
  const nounUnion = new Set([...nouns1Set, ...nouns2Set])
  const nounSimilarity = nounIntersection.size / Math.max(nounUnion.size, 1)
  
  // Category similarity bonus
  const categoryBonus = post1.category === post2.category ? 0.1 : 0
  
  // Weighted combination of different similarity measures
  const weights = CONFIG.similarityWeights
  return (keywordSimilarity * weights.keyword) + 
         (termSimilarity * weights.term) + 
         (nounSimilarity * weights.cosine) + 
         categoryBonus
}

// Find anchor text opportunities in content using compromise
const findAnchorOpportunities = (content, targetPost) => {
  const opportunities = []
  const contentDoc = nlp(content.toLowerCase())
  const contentText = content.toLowerCase()
  
  // Look for title phrases (prefer longer phrases)
  const titlePhrase = targetPost.title.toLowerCase()
  if (contentText.includes(titlePhrase)) {
    const regex = new RegExp(`\\b${titlePhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    let match
    while ((match = regex.exec(content)) !== null) {
      opportunities.push({
        term: targetPost.title,
        position: match.index,
        type: 'title-phrase',
        score: 1.0,
        length: titlePhrase.length
      })
    }
  }
  
  // Look for title words using NLP
  const titleDoc = nlp(targetPost.title)
  const titleWords = titleDoc.terms()
    .filter(term => term.text.length >= CONFIG.minWordLength)
    .out('array')
  
  titleWords.forEach(word => {
    const wordLower = word.toLowerCase()
    const regex = new RegExp(`\\b${wordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    let match
    while ((match = regex.exec(content)) !== null) {
      // Skip if already covered by title phrase
      const isPartOfPhrase = opportunities.some(opp => 
        opp.type === 'title-phrase' && 
        match.index >= opp.position && 
        match.index <= opp.position + opp.length
      )
      if (!isPartOfPhrase) {
        opportunities.push({
          term: word,
          position: match.index,
          type: 'title-word',
          score: 0.7,
          length: word.length
        })
      }
    }
  })
  
  // Look for keywords
  targetPost.keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase()
    const regex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    let match
    while ((match = regex.exec(content)) !== null) {
      opportunities.push({
        term: keyword,
        position: match.index,
        type: 'keyword',
        score: 0.9,
        length: keyword.length
      })
    }
  })
  
  // Sort by score, then by length, then by position
  return opportunities
    .sort((a, b) => b.score - a.score || b.length - a.length || a.position - b.position)
    .slice(0, 3)
}

// Generate semantic links within content
export const generateSemanticLinks = (content, currentPostId, relatedPosts) => {
  if (!content || !relatedPosts.length) return content
  
  let linkedContent = content
  let linkCount = 0
  const usedPositions = []
  const usedTerms = new Set()
  
  // Sort related posts by similarity score
  const sortedPosts = relatedPosts.sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0))
  
  sortedPosts.forEach(relatedPost => {
    if (linkCount >= CONFIG.maxLinksPerPost) return
    
    const opportunities = findAnchorOpportunities(linkedContent, relatedPost)
    
    opportunities.forEach(opportunity => {
      if (linkCount >= CONFIG.maxLinksPerPost) return
      if (usedTerms.has(opportunity.term.toLowerCase())) return
      
      // Check for position conflicts
      const conflictsWithExisting = usedPositions.some(pos => 
        Math.abs(pos - opportunity.position) < CONFIG.contextWindowSize
      )
      if (conflictsWithExisting) return
      
      const escapedTerm = opportunity.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`\\b${escapedTerm}\\b`, 'i')
      
      // Check if term is not already linked
      const termMatch = linkedContent.match(regex)
      if (termMatch && !linkedContent.substring(termMatch.index - 10, termMatch.index + opportunity.term.length + 10).includes('<a ')) {
        const replacement = `<a href="/post/${relatedPost.slug}" class="semantic-link inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 underline decoration-1 underline-offset-2 transition-colors duration-200" title="Related article: ${relatedPost.title}" data-semantic-link="true">${opportunity.term}</a>`
        
        linkedContent = linkedContent.replace(regex, replacement)
        usedPositions.push(opportunity.position)
        usedTerms.add(opportunity.term.toLowerCase())
        linkCount++
      }
    })
  })
  
  return linkedContent
}

// Analyze content for semantic linking opportunities
export const analyzeContentForLinks = async (content, currentPostId) => {
  const allPosts = await getAllPosts()
  const publishedPosts = allPosts.filter(post =>
    post.Id !== currentPostId && post.status === 'published'
  )
  
  if (!publishedPosts.length) return { content, suggestions: [] }
  
const currentPost = allPosts.find(p => p.Id === currentPostId)
  if (!currentPost) return { content, suggestions: [] }
  
  // Calculate similarities using compromise
const scoredPosts = publishedPosts.map(async post => ({
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
export const getLinkingStats = async (postId) => {
  const allPosts = await getAllPosts()
  const post = allPosts.find(p => p.Id === postId)
  if (!post) return null
  
const publishedPosts = allPosts.filter(p => 
    p.Id !== postId && p.status === 'published'
  )
  
  const similarities = publishedPosts.map(p => ({
    postId: p.Id,
    title: p.title,
similarity: await calculatePostSimilarity(post, p)
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