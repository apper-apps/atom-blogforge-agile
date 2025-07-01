import { posts } from '@/services/mockData/posts'
import { analytics } from '@/services/mockData/analytics'

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const getAnalytics = async (timeRange = '30') => {
  await delay(400)
  
  const totalPosts = posts.length
  const totalViews = posts.reduce((sum, post) => sum + post.views, 0)
  const publishedPosts = posts.filter(post => post.status === 'published')
  const avgViewsPerPost = publishedPosts.length > 0 ? Math.round(totalViews / publishedPosts.length) : 0
  
  // Generate daily views data based on time range
  const days = parseInt(timeRange)
  const dailyViews = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    dailyViews.push({
      date: dateStr,
      views: Math.floor(Math.random() * 500) + 100,
      uniqueVisitors: Math.floor(Math.random() * 300) + 50
    })
  }
  
  return {
    totalPosts,
    totalViews,
    monthlyViews: Math.floor(totalViews * 0.3),
    avgViewsPerPost,
    uniqueVisitors: Math.floor(totalViews * 0.7),
    avgSessionDuration: '2m 34s',
    bounceRate: '45.2%',
    dailyViews,
    trafficSources: [
      { name: 'Organic Search', visits: Math.floor(totalViews * 0.4), percentage: 40, color: '#2563eb' },
      { name: 'Direct', visits: Math.floor(totalViews * 0.25), percentage: 25, color: '#7c3aed' },
      { name: 'Social Media', visits: Math.floor(totalViews * 0.2), percentage: 20, color: '#f59e0b' },
      { name: 'Referral', visits: Math.floor(totalViews * 0.15), percentage: 15, color: '#10b981' }
    ],
    devices: [
      { name: 'Desktop', visits: Math.floor(totalViews * 0.6), percentage: 60, icon: 'Monitor' },
      { name: 'Mobile', visits: Math.floor(totalViews * 0.35), percentage: 35, icon: 'Smartphone' },
      { name: 'Tablet', visits: Math.floor(totalViews * 0.05), percentage: 5, icon: 'Tablet' }
    ]
  }
}

export const getPostAnalytics = async () => {
  await delay(300)
  return posts
    .filter(post => post.status === 'published')
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
}

export const getTrafficSources = async () => {
  await delay(300)
  return analytics.trafficSources
}

export const getDeviceStats = async () => {
  await delay(300)
  return analytics.devices
}