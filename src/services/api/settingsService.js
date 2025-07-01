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

// Domain Management Functions
export const getDomains = async () => {
  await delay(300)
  return [...settings.domains]
}

export const addDomain = async (domainData) => {
  await delay(400)
  const newDomain = {
    ...domainData,
    Id: Math.max(...settings.domains.map(d => d.Id), 0) + 1,
    verified: false,
    sslEnabled: false,
    createdAt: new Date().toISOString(),
    dnsRecords: []
  }
  settings.domains.push(newDomain)
  return { ...newDomain }
}

export const updateDomain = async (id, domainData) => {
  await delay(400)
  const index = settings.domains.findIndex(d => d.Id === id)
  if (index === -1) throw new Error('Domain not found')
  
  settings.domains[index] = { ...settings.domains[index], ...domainData }
  return { ...settings.domains[index] }
}

export const deleteDomain = async (id) => {
  await delay(300)
  const index = settings.domains.findIndex(d => d.Id === id)
  if (index === -1) throw new Error('Domain not found')
  
  settings.domains.splice(index, 1)
  return true
}

export const verifyDomain = async (id) => {
  await delay(1000) // Longer delay to simulate DNS verification
  const index = settings.domains.findIndex(d => d.Id === id)
  if (index === -1) throw new Error('Domain not found')
  
  // Simulate verification logic
  const verified = Math.random() > 0.3 // 70% success rate
  settings.domains[index].verified = verified
  settings.domains[index].lastVerified = new Date().toISOString()
  
  return { ...settings.domains[index] }
}

export const addDnsRecord = async (domainId, recordData) => {
  await delay(400)
  const domainIndex = settings.domains.findIndex(d => d.Id === domainId)
  if (domainIndex === -1) throw new Error('Domain not found')
  
  const newRecord = {
    ...recordData,
    Id: Math.max(...settings.domains[domainIndex].dnsRecords.map(r => r.Id), 0) + 1,
    createdAt: new Date().toISOString()
  }
  
  settings.domains[domainIndex].dnsRecords.push(newRecord)
  return { ...newRecord }
}

export const updateDnsRecord = async (domainId, recordId, recordData) => {
  await delay(400)
  const domainIndex = settings.domains.findIndex(d => d.Id === domainId)
  if (domainIndex === -1) throw new Error('Domain not found')
  
  const recordIndex = settings.domains[domainIndex].dnsRecords.findIndex(r => r.Id === recordId)
  if (recordIndex === -1) throw new Error('DNS record not found')
  
  settings.domains[domainIndex].dnsRecords[recordIndex] = {
    ...settings.domains[domainIndex].dnsRecords[recordIndex],
    ...recordData
  }
  
  return { ...settings.domains[domainIndex].dnsRecords[recordIndex] }
}

export const deleteDnsRecord = async (domainId, recordId) => {
  await delay(300)
  const domainIndex = settings.domains.findIndex(d => d.Id === domainId)
  if (domainIndex === -1) throw new Error('Domain not found')
  
  const recordIndex = settings.domains[domainIndex].dnsRecords.findIndex(r => r.Id === recordId)
  if (recordIndex === -1) throw new Error('DNS record not found')
  
  settings.domains[domainIndex].dnsRecords.splice(recordIndex, 1)
  return true
}