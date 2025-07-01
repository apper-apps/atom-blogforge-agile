import { XMLBuilder } from 'fast-xml-parser'
import { getPublishedPosts } from '@/services/api/postsService'

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// RSS feed configuration
const RSS_CONFIG = {
  title: 'TechBlog - Latest Posts',
  description: 'Sharing insights, tutorials, and thoughts on technology, programming, and digital innovation.',
  link: window.location ? window.location.origin : 'https://techblog.com',
  language: 'en-us',
  copyright: '© 2024 TechBlog. All rights reserved.',
  managingEditor: 'john@techblog.com (John Doe)',
  webMaster: 'admin@techblog.com (Admin)',
  category: 'Technology',
  generator: 'BlogForge RSS Generator',
  ttl: 60 // Time to live in minutes
}

// Clean HTML content for RSS feed
const cleanContent = (content) => {
  // Remove HTML tags but keep basic formatting
  return content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 500) + '...' // Limit length for RSS
}

// Generate RSS feed XML
export const generateRSSFeed = async () => {
  try {
    await delay(200)
    
    // Get published posts
    const posts = await getPublishedPosts()
    
    // Build RSS feed structure
    const rssData = {
      rss: {
        '@version': '2.0',
        '@xmlns:atom': 'http://www.w3.org/2005/Atom',
        '@xmlns:content': 'http://purl.org/rss/1.0/modules/content/',
        channel: {
          title: RSS_CONFIG.title,
          description: RSS_CONFIG.description,
          link: RSS_CONFIG.link,
          language: RSS_CONFIG.language,
          copyright: RSS_CONFIG.copyright,
          managingEditor: RSS_CONFIG.managingEditor,
          webMaster: RSS_CONFIG.webMaster,
          category: RSS_CONFIG.category,
          generator: RSS_CONFIG.generator,
          ttl: RSS_CONFIG.ttl,
          lastBuildDate: new Date().toUTCString(),
          pubDate: posts.length > 0 ? new Date(posts[0].publishedAt).toUTCString() : new Date().toUTCString(),
          'atom:link': {
            '@href': `${RSS_CONFIG.link}/rss.xml`,
            '@rel': 'self',
            '@type': 'application/rss+xml'
          },
          item: posts.slice(0, 20).map(post => ({
            title: post.title,
            description: cleanContent(post.excerpt || post.content),
            link: `${RSS_CONFIG.link}/post/${post.slug}`,
            guid: {
              '@isPermaLink': 'true',
              '#text': `${RSS_CONFIG.link}/post/${post.slug}`
            },
            pubDate: new Date(post.publishedAt).toUTCString(),
            author: `${post.author?.email || 'noreply@techblog.com'} (${post.author?.name || 'Unknown Author'})`,
            category: post.category || 'Technology',
            'content:encoded': `<![CDATA[${post.contentWithLinks || post.content}]]>`,
            source: {
              '@url': `${RSS_CONFIG.link}/rss.xml`,
              '#text': RSS_CONFIG.title
            }
          }))
        }
      }
    }
    
    // Generate XML
    const builder = new XMLBuilder({
      attributeNamePrefix: '@',
      textNodeName: '#text',
      ignoreAttributes: false,
      cdataPropName: '__cdata',
      format: true,
      indentBy: '  ',
      suppressEmptyNode: true
    })
    
    const xmlContent = builder.build(rssData)
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n'
    
    // Store RSS feed (in real app, this would write to file system or CDN)
    const rssXml = xmlHeader + xmlContent
    
    // For browser environment, we'll store in localStorage for demo
    if (typeof window !== 'undefined') {
      localStorage.setItem('rss-feed', rssXml)
    }
    
    return rssXml
  } catch (error) {
    console.error('Failed to generate RSS feed:', error)
    throw error
  }
}

// Get current RSS feed
export const getRSSFeed = async () => {
  try {
    await delay(100)
    
    // In browser environment, get from localStorage
    if (typeof window !== 'undefined') {
      const cachedFeed = localStorage.getItem('rss-feed')
      if (cachedFeed) {
        return cachedFeed
      }
    }
    
    // Generate new feed if none exists
    return await generateRSSFeed()
  } catch (error) {
    console.error('Failed to get RSS feed:', error)
    throw error
  }
}

// Validate RSS feed
export const validateRSSFeed = async () => {
  try {
    const feed = await getRSSFeed()
    
    // Basic validation checks
    const validationResults = {
      isValid: true,
      errors: [],
      warnings: []
    }
    
    // Check for required elements
    if (!feed.includes('<title>')) {
      validationResults.errors.push('Missing required <title> element')
      validationResults.isValid = false
    }
    
    if (!feed.includes('<description>')) {
      validationResults.errors.push('Missing required <description> element')
      validationResults.isValid = false
    }
    
    if (!feed.includes('<link>')) {
      validationResults.errors.push('Missing required <link> element')
      validationResults.isValid = false
    }
    
    // Check for recommended elements
    if (!feed.includes('<pubDate>')) {
      validationResults.warnings.push('Missing recommended <pubDate> element')
    }
    
    if (!feed.includes('<lastBuildDate>')) {
      validationResults.warnings.push('Missing recommended <lastBuildDate> element')
    }
    
    return validationResults
  } catch (error) {
    return {
      isValid: false,
      errors: ['Failed to validate RSS feed: ' + error.message],
      warnings: []
    }
  }
}

// RSS feed statistics
export const getRSSStats = async () => {
  try {
    await delay(100)
    
    const posts = await getPublishedPosts()
    const feed = await getRSSFeed()
    
    return {
      totalPosts: posts.length,
      feedSize: feed.length,
      lastGenerated: new Date().toISOString(),
      itemsInFeed: Math.min(posts.length, 20),
      feedValid: (await validateRSSFeed()).isValid
    }
  } catch (error) {
    console.error('Failed to get RSS stats:', error)
    return {
      totalPosts: 0,
      feedSize: 0,
      lastGenerated: null,
      itemsInFeed: 0,
      feedValid: false
    }
  }
}