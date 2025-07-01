import { settings } from '@/services/mockData/settings'

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const getBlogSettings = async () => {
  await delay(300)
  return { ...settings }
}

export const updateBlogSettings = async (newSettings) => {
  await delay(400)
  Object.assign(settings, newSettings)
  return { ...settings }
}

export const resetSettings = async () => {
  await delay(300)
  // Reset to default values
  Object.assign(settings, {
    blogTitle: 'My Blog',
    tagline: 'Just another blog',
    description: '',
    logo: '',
    favicon: '',
    socialLinks: {
      twitter: '',
      facebook: '',
      linkedin: '',
      github: ''
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      googleAnalytics: '',
      facebookPixel: ''
    },
    theme: {
      primaryColor: '#2563eb',
      accentColor: '#7c3aed',
      darkMode: false
    }
  })
  return { ...settings }
}