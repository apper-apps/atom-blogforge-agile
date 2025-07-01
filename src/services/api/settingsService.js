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

export const getBlogSettings = async () => {
  await delay(300)
  try {
    const apperClient = getApperClient()
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "blog_title" } },
        { field: { Name: "tagline" } },
        { field: { Name: "description" } },
        { field: { Name: "logo" } },
        { field: { Name: "favicon" } },
        { field: { Name: "social_links" } },
        { field: { Name: "seo" } },
        { field: { Name: "theme" } },
        { field: { Name: "domains" } },
        { field: { Name: "updated_at" } }
      ],
      pagingInfo: { limit: 1, offset: 0 }
    }
    
    const response = await apperClient.fetchRecords("setting", params)
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      return getDefaultSettings()
    }
    
    if (response.data && response.data.length > 0) {
      const settings = response.data[0]
      
      // Parse JSON fields
      try {
        if (typeof settings.social_links === 'string') {
          settings.social_links = JSON.parse(settings.social_links)
        }
        if (typeof settings.seo === 'string') {
          settings.seo = JSON.parse(settings.seo)
        }
        if (typeof settings.theme === 'string') {
          settings.theme = JSON.parse(settings.theme)
        }
        if (typeof settings.domains === 'string') {
          settings.domains = JSON.parse(settings.domains)
        }
      } catch (error) {
        console.warn('Error parsing settings JSON fields:', error)
      }
      
      return settings
    }
    
    return getDefaultSettings()
  } catch (error) {
    console.error("Error fetching blog settings:", error)
    toast.error("Failed to fetch blog settings")
    return getDefaultSettings()
  }
}

const getDefaultSettings = () => ({
  blog_title: 'TechBlog',
  tagline: 'Insights, Tutorials & Technology Trends',
  description: 'A modern blog focused on web development, artificial intelligence, sustainability, and the future of technology.',
  logo: '',
  favicon: '',
  social_links: {
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
  },
  domains: []
})

export const updateBlogSettings = async (newSettings) => {
  await delay(400)
  try {
    const apperClient = getApperClient()
    
    // Check if settings exist
    const existingSettings = await getBlogSettings()
    
    // Prepare JSON fields
    const settingsData = {
      Name: newSettings.Name || newSettings.blog_title || 'Blog Settings',
      Tags: newSettings.Tags || '',
      blog_title: newSettings.blog_title || newSettings.blogTitle,
      tagline: newSettings.tagline,
      description: newSettings.description,
      logo: newSettings.logo,
      favicon: newSettings.favicon,
      social_links: typeof newSettings.social_links === 'object' 
        ? JSON.stringify(newSettings.social_links) 
        : newSettings.social_links,
      seo: typeof newSettings.seo === 'object' 
        ? JSON.stringify(newSettings.seo) 
        : newSettings.seo,
      theme: typeof newSettings.theme === 'object' 
        ? JSON.stringify(newSettings.theme) 
        : newSettings.theme,
      domains: typeof newSettings.domains === 'object' 
        ? JSON.stringify(newSettings.domains) 
        : newSettings.domains,
      updated_at: new Date().toISOString()
    }
    
    let response
    
    if (existingSettings.Id) {
      // Update existing settings
      const params = {
        records: [{
          Id: existingSettings.Id,
          ...settingsData
        }]
      }
      response = await apperClient.updateRecord("setting", params)
    } else {
      // Create new settings
      const params = {
        records: [settingsData]
      }
      response = await apperClient.createRecord("setting", params)
    }
    
    if (!response.success) {
      console.error(response.message)
      toast.error(response.message)
      throw new Error('Failed to update settings')
    }
    
    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success)
      const failedRecords = response.results.filter(result => !result.success)
      
      if (failedRecords.length > 0) {
        console.error(`Failed to update ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`)
          })
          if (record.message) toast.error(record.message)
        })
      }
      
      const updatedSettings = successfulRecords[0]?.data
      if (updatedSettings) {
        toast.success('Settings updated successfully')
        return await getBlogSettings() // Return refreshed settings
      }
    }
    
    throw new Error('Failed to update settings')
  } catch (error) {
    console.error("Error updating blog settings:", error)
    throw error
  }
}

export const resetSettings = async () => {
  await delay(300)
  try {
    const defaultSettings = getDefaultSettings()
    return await updateBlogSettings(defaultSettings)
  } catch (error) {
    console.error("Error resetting settings:", error)
    throw error
  }
}

// Domain Management Functions - These remain as mock implementations
// since domains are stored as JSON within the settings record

export const getDomains = async () => {
  await delay(300)
  try {
    const settings = await getBlogSettings()
    return settings.domains || []
  } catch (error) {
    console.error("Error fetching domains:", error)
    return []
  }
}

export const addDomain = async (domainData) => {
  await delay(400)
  try {
    const settings = await getBlogSettings()
    const domains = settings.domains || []
    
    const newDomain = {
      ...domainData,
      Id: domains.length > 0 ? Math.max(...domains.map(d => d.Id || 0)) + 1 : 1,
      verified: false,
      sslEnabled: false,
      createdAt: new Date().toISOString(),
      dnsRecords: []
    }
    
    domains.push(newDomain)
    
    await updateBlogSettings({ ...settings, domains })
    toast.success('Domain added successfully')
    return newDomain
  } catch (error) {
    console.error("Error adding domain:", error)
    throw error
  }
}

export const updateDomain = async (id, domainData) => {
  await delay(400)
  try {
    const settings = await getBlogSettings()
    const domains = settings.domains || []
    const index = domains.findIndex(d => d.Id === id)
    
    if (index === -1) throw new Error('Domain not found')
    
    domains[index] = { ...domains[index], ...domainData }
    
    await updateBlogSettings({ ...settings, domains })
    toast.success('Domain updated successfully')
    return domains[index]
  } catch (error) {
    console.error("Error updating domain:", error)
    throw error
  }
}

export const deleteDomain = async (id) => {
  await delay(300)
  try {
    const settings = await getBlogSettings()
    const domains = settings.domains || []
    const index = domains.findIndex(d => d.Id === id)
    
    if (index === -1) throw new Error('Domain not found')
    
    domains.splice(index, 1)
    
    await updateBlogSettings({ ...settings, domains })
    toast.success('Domain deleted successfully')
    return true
  } catch (error) {
    console.error("Error deleting domain:", error)
    throw error
  }
}

export const verifyDomain = async (id) => {
  await delay(1000) // Longer delay to simulate DNS verification
  try {
    const settings = await getBlogSettings()
    const domains = settings.domains || []
    const index = domains.findIndex(d => d.Id === id)
    
    if (index === -1) throw new Error('Domain not found')
    
    // Simulate verification logic
    const verified = Math.random() > 0.3 // 70% success rate
    domains[index].verified = verified
    domains[index].lastVerified = new Date().toISOString()
    
    await updateBlogSettings({ ...settings, domains })
    
    if (verified) {
      toast.success('Domain verified successfully')
    } else {
      toast.error('Domain verification failed')
    }
    
    return domains[index]
  } catch (error) {
    console.error("Error verifying domain:", error)
    throw error
  }
}

export const addDnsRecord = async (domainId, recordData) => {
  await delay(400)
  try {
    const settings = await getBlogSettings()
    const domains = settings.domains || []
    const domainIndex = domains.findIndex(d => d.Id === domainId)
    
    if (domainIndex === -1) throw new Error('Domain not found')
    
    const dnsRecords = domains[domainIndex].dnsRecords || []
    const newRecord = {
      ...recordData,
      Id: dnsRecords.length > 0 ? Math.max(...dnsRecords.map(r => r.Id || 0)) + 1 : 1,
      createdAt: new Date().toISOString()
    }
    
    domains[domainIndex].dnsRecords = [...dnsRecords, newRecord]
    
    await updateBlogSettings({ ...settings, domains })
    toast.success('DNS record added successfully')
    return newRecord
  } catch (error) {
    console.error("Error adding DNS record:", error)
    throw error
  }
}

export const updateDnsRecord = async (domainId, recordId, recordData) => {
  await delay(400)
  try {
    const settings = await getBlogSettings()
    const domains = settings.domains || []
    const domainIndex = domains.findIndex(d => d.Id === domainId)
    
    if (domainIndex === -1) throw new Error('Domain not found')
    
    const dnsRecords = domains[domainIndex].dnsRecords || []
    const recordIndex = dnsRecords.findIndex(r => r.Id === recordId)
    
    if (recordIndex === -1) throw new Error('DNS record not found')
    
    dnsRecords[recordIndex] = { ...dnsRecords[recordIndex], ...recordData }
    domains[domainIndex].dnsRecords = dnsRecords
    
    await updateBlogSettings({ ...settings, domains })
    toast.success('DNS record updated successfully')
    return dnsRecords[recordIndex]
  } catch (error) {
    console.error("Error updating DNS record:", error)
    throw error
  }
}

export const deleteDnsRecord = async (domainId, recordId) => {
  await delay(300)
  try {
    const settings = await getBlogSettings()
    const domains = settings.domains || []
    const domainIndex = domains.findIndex(d => d.Id === domainId)
    
    if (domainIndex === -1) throw new Error('Domain not found')
    
    const dnsRecords = domains[domainIndex].dnsRecords || []
    const recordIndex = dnsRecords.findIndex(r => r.Id === recordId)
    
    if (recordIndex === -1) throw new Error('DNS record not found')
    
    dnsRecords.splice(recordIndex, 1)
    domains[domainIndex].dnsRecords = dnsRecords
    
    await updateBlogSettings({ ...settings, domains })
    toast.success('DNS record deleted successfully')
    return true
  } catch (error) {
    console.error("Error deleting DNS record:", error)
    throw error
  }
}