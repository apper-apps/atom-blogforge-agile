import { getPublishedPosts } from '@/services/api/postsService'
import { getBlogSettings } from '@/services/api/settingsService'

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let sitemapCache = null
let lastGenerated = null

// Generate XML sitemap content
export const generateSitemap = async () => {
  await delay(200)
  
  try {
    const settings = await getBlogSettings()
    if (!settings.seo.sitemapEnabled || !settings.seo.baseUrl) {
      return null
    }
    
const baseUrl = (settings.seo?.baseUrl || window.location.origin).replace(/\/$/, '')
    const publishedPosts = await getPublishedPosts()
    
    // Build sitemap XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    // Add homepage
    xml += '  <url>\n'
    xml += `    <loc>${baseUrl}</loc>\n`
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`
    xml += '    <changefreq>daily</changefreq>\n'
    xml += '    <priority>1.0</priority>\n'
    xml += '  </url>\n'
    
    // Add blog posts
    publishedPosts.forEach(post => {
      xml += '  <url>\n'
      xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`
      xml += `    <lastmod>${post.updatedAt || post.publishedAt || post.createdAt}</lastmod>\n`
      xml += '    <changefreq>weekly</changefreq>\n'
      xml += '    <priority>0.8</priority>\n'
      xml += '  </url>\n'
    })
    
    // Add blog index
    xml += '  <url>\n'
    xml += `    <loc>${baseUrl}/blog</loc>\n`
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`
    xml += '    <changefreq>daily</changefreq>\n'
    xml += '    <priority>0.9</priority>\n'
    xml += '  </url>\n'
    
    xml += '</urlset>'
    
    sitemapCache = xml
    lastGenerated = new Date().toISOString()
    
    return xml
  } catch (error) {
    console.error('Error generating sitemap:', error)
    throw new Error('Failed to generate sitemap')
  }
}

// Update sitemap (regenerate and cache)
export const updateSitemap = async () => {
  await delay(100)
  
  try {
    await generateSitemap()
    return true
  } catch (error) {
    console.error('Error updating sitemap:', error)
    throw new Error('Failed to update sitemap')
  }
}

// Get current sitemap
export const getSitemap = async () => {
  await delay(100)
  
  try {
    // Return cached version if available and recent (less than 1 hour old)
    if (sitemapCache && lastGenerated) {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
      if (new Date(lastGenerated) > hourAgo) {
        return {
          xml: sitemapCache,
          lastGenerated,
          cached: true
        }
      }
    }
    
    // Generate fresh sitemap
    const xml = await generateSitemap()
    return {
      xml,
      lastGenerated,
      cached: false
    }
  } catch (error) {
    console.error('Error getting sitemap:', error)
    throw new Error('Failed to get sitemap')
  }
}

// Get sitemap statistics
export const getSitemapStats = async () => {
  await delay(200)
  
  try {
const settings = await getBlogSettings()
    const publishedPosts = await getPublishedPosts()
    
    return {
      enabled: settings.seo.sitemapEnabled || false,
      baseUrl: settings.seo.baseUrl || '',
      totalUrls: publishedPosts.length + 2, // posts + homepage + blog index
      publishedPosts: publishedPosts.length,
lastGenerated: lastGenerated,
      sitemapUrl: settings.seo?.baseUrl ? `${settings.seo.baseUrl.replace(/\/$/, '')}/sitemap.xml` : null
    }
  } catch (error) {
    console.error('Error getting sitemap stats:', error)
    throw new Error('Failed to get sitemap statistics')
  }
}

// Clear sitemap cache
export const clearSitemapCache = async () => {
  await delay(50)
  sitemapCache = null
  lastGenerated = null
  return true
}

// Initialize sitemap on service load
const initializeSitemap = async () => {
  try {
const settings = await getBlogSettings()
    if (settings.seo?.sitemapEnabled) {
      await generateSitemap()
    }
  } catch (error) {
    console.warn('Failed to initialize sitemap:', error)
  }
}

// Auto-initialize
initializeSitemap()