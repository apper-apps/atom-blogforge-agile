import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import { getBlogSettings, updateBlogSettings } from "@/services/api/settingsService";

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    blogTitle: '',
    tagline: '',
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
      facebookPixel: '',
      sitemapEnabled: true,
      baseUrl: 'https://yourblog.com'
    },
    theme: {
      primaryColor: '#2563eb',
      accentColor: '#7c3aed',
      darkMode: false
    }
})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // DNS management state
  const [domains, setDomains] = useState([])
  const [showAddDomain, setShowAddDomain] = useState(false)
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [newDomain, setNewDomain] = useState('')
  const [newRecord, setNewRecord] = useState({
    type: 'A',
    name: '',
    value: '',
    ttl: 3600
  })

  useEffect(() => {
    loadSettings()
    loadDomains()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await getBlogSettings()
      setSettings(data)
    } catch (err) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
}

  const loadDomains = async () => {
    try {
      // Mock domains data - replace with actual API call
      setDomains([
        {
          Id: '1',
          domain: 'example.com',
          verified: true,
          lastVerified: new Date().toISOString(),
          dnsRecords: [
            {
              Id: '1',
              type: 'A',
              name: '@',
              value: '192.168.1.1',
              ttl: 3600
            }
          ]
        }
      ])
    } catch (err) {
      toast.error('Failed to load domains')
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateBlogSettings(settings)
      toast.success('Settings saved successfully')
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (path, value) => {
    setSettings(prev => {
      const newSettings = { ...prev }
      const keys = path.split('.')
      let current = newSettings
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newSettings
    })
  }

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return
    
    try {
      setSaving(true)
      const newDomainObj = {
        Id: Date.now().toString(),
        domain: newDomain.trim(),
        verified: false,
        lastVerified: null,
        dnsRecords: []
      }
      setDomains(prev => [...prev, newDomainObj])
      setNewDomain('')
      setShowAddDomain(false)
      toast.success('Domain added successfully')
    } catch (err) {
      toast.error('Failed to add domain')
    } finally {
      setSaving(false)
    }
  }

  const handleVerifyDomain = async (domainId) => {
    try {
      setSaving(true)
      setDomains(prev => prev.map(domain => 
        domain.Id === domainId 
          ? { ...domain, verified: true, lastVerified: new Date().toISOString() }
          : domain
      ))
      toast.success('Domain verified successfully')
    } catch (err) {
      toast.error('Failed to verify domain')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteDomain = async (domainId) => {
    if (!confirm('Are you sure you want to delete this domain?')) return
    
    try {
      setSaving(true)
      setDomains(prev => prev.filter(domain => domain.Id !== domainId))
      toast.success('Domain deleted successfully')
    } catch (err) {
      toast.error('Failed to delete domain')
    } finally {
      setSaving(false)
    }
  }

  const handleAddDnsRecord = async () => {
    if (!newRecord.name || !newRecord.value || !selectedDomain) return
    
    try {
      setSaving(true)
      const record = {
        Id: Date.now().toString(),
        ...newRecord
      }
      
      setDomains(prev => prev.map(domain => 
        domain.Id === selectedDomain.Id 
          ? { ...domain, dnsRecords: [...domain.dnsRecords, record] }
          : domain
      ))
      
      setNewRecord({ type: 'A', name: '', value: '', ttl: 3600 })
      setShowAddRecord(false)
      setSelectedDomain(null)
      toast.success('DNS record added successfully')
    } catch (err) {
      toast.error('Failed to add DNS record')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteDnsRecord = async (domainId, recordId) => {
    if (!confirm('Are you sure you want to delete this DNS record?')) return
    
    try {
      setSaving(true)
      setDomains(prev => prev.map(domain => 
        domain.Id === domainId 
          ? { ...domain, dnsRecords: domain.dnsRecords.filter(record => record.Id !== recordId) }
          : domain
      ))
      toast.success('DNS record deleted successfully')
    } catch (err) {
      toast.error('Failed to delete DNS record')
    } finally {
      setSaving(false)
    }
  }

const tabs = [
    { id: 'general', label: 'General', icon: 'Settings' },
    { id: 'social', label: 'Social Media', icon: 'Share2' },
    { id: 'seo', label: 'SEO', icon: 'Search' },
    { id: 'theme', label: 'Theme', icon: 'Palette' },
    { id: 'dns', label: 'DNS', icon: 'Globe' }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your blog configuration and preferences
          </p>
        </div>
        
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={saving}
        >
          Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <ApperIcon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Blog Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Blog Title"
                  value={settings.blogTitle}
                  onChange={(e) => handleInputChange('blogTitle', e.target.value)}
                  placeholder="My Awesome Blog"
                />
                
                <Input
                  label="Tagline"
                  value={settings.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  placeholder="Just another blog"
                />
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={settings.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="input-field"
                  placeholder="Tell your readers what your blog is about..."
                />
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Branding
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Logo URL"
                  value={settings.logo}
                  onChange={(e) => handleInputChange('logo', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                
                <Input
                  label="Favicon URL"
                  value={settings.favicon}
                  onChange={(e) => handleInputChange('favicon', e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                />
              </div>
              
              {settings.logo && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Logo Preview:</p>
                  <img
                    src={settings.logo}
                    alt="Logo"
                    className="h-16 w-auto"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Media Settings */}
        {activeTab === 'social' && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Social Media Links
            </h2>
            <div className="space-y-6">
              <Input
                label="Twitter"
                value={settings.socialLinks.twitter}
                onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                placeholder="https://twitter.com/username"
                icon="Twitter"
              />
              
              <Input
                label="Facebook"
                value={settings.socialLinks.facebook}
                onChange={(e) => handleInputChange('socialLinks.facebook', e.target.value)}
                placeholder="https://facebook.com/username"
                icon="Facebook"
              />
              
              <Input
                label="LinkedIn"
                value={settings.socialLinks.linkedin}
                onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                icon="Linkedin"
              />
              
              <Input
                label="GitHub"
                value={settings.socialLinks.github}
                onChange={(e) => handleInputChange('socialLinks.github', e.target.value)}
                placeholder="https://github.com/username"
                icon="Github"
              />
            </div>
          </div>
        )}

        {/* SEO Settings */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                SEO Configuration
              </h2>
              <div className="space-y-6">
                <Input
                  label="Meta Title"
                  value={settings.seo.metaTitle}
                  onChange={(e) => handleInputChange('seo.metaTitle', e.target.value)}
                  placeholder="Your blog's meta title"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={settings.seo.metaDescription}
                    onChange={(e) => handleInputChange('seo.metaDescription', e.target.value)}
                    rows={3}
                    className="input-field"
                    placeholder="Brief description for search engines"
                  />
                </div>
                
                <Input
                  label="Keywords"
                  value={settings.seo.keywords}
                  onChange={(e) => handleInputChange('seo.keywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Analytics & Tracking
              </h2>
              <div className="space-y-6">
                <Input
                  label="Google Analytics ID"
                  value={settings.seo.googleAnalytics}
                  onChange={(e) => handleInputChange('seo.googleAnalytics', e.target.value)}
                  placeholder="GA-XXXXXXXXX-X"
                />
                
                <Input
                  label="Facebook Pixel ID"
                  value={settings.seo.facebookPixel}
onChange={(e) => handleInputChange('seo.facebookPixel', e.target.value)}
                  placeholder="123456789012345"
                />
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                XML Sitemap
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      Enable XML Sitemap
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Automatically generate and update XML sitemap for search engines
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.seo.sitemapEnabled}
                      onChange={(e) => handleInputChange('seo.sitemapEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                
                <Input
                  label="Base URL"
                  value={settings.seo.baseUrl}
                  onChange={(e) => handleInputChange('seo.baseUrl', e.target.value)}
                  placeholder="https://yourblog.com"
                  helperText="Base URL for generating sitemap links"
                />
                
                {settings.seo.sitemapEnabled && settings.seo.baseUrl && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <ApperIcon name="Info" size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Sitemap URL
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-300 mt-1 font-mono">
                          {settings.seo.baseUrl.replace(/\/$/, '')}/sitemap.xml
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                          Submit this URL to Google Search Console and other search engines
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Theme Settings */}
        {activeTab === 'theme' && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Theme Customization
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={settings.theme.primaryColor}
                    onChange={(e) => handleInputChange('theme.primaryColor', e.target.value)}
                    className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <Input
                    value={settings.theme.primaryColor}
                    onChange={(e) => handleInputChange('theme.primaryColor', e.target.value)}
                    placeholder="#2563eb"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={settings.theme.accentColor}
                    onChange={(e) => handleInputChange('theme.accentColor', e.target.value)}
                    className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <Input
                    value={settings.theme.accentColor}
                    onChange={(e) => handleInputChange('theme.accentColor', e.target.value)}
                    placeholder="#7c3aed"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Dark Mode
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enable dark mode by default for new visitors
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.theme.darkMode}
                    onChange={(e) => handleInputChange('theme.darkMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>
)}

        {/* DNS Management */}
        {activeTab === 'dns' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Domain Management
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage custom domains and DNS settings for your blog
                </p>
              </div>
              <Button
                onClick={() => setShowAddDomain(true)}
                className="flex items-center space-x-2"
              >
                <ApperIcon name="Plus" size={16} />
                <span>Add Domain</span>
              </Button>
            </div>

            {/* Domains List */}
            <div className="grid gap-6">
              {domains.map((domain) => (
                <div key={domain.Id} className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        domain.verified ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {domain.domain}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {domain.verified ? 'Verified' : 'Pending Verification'}
                          {domain.lastVerified && (
                            <span className="ml-2">
                              • Last verified: {new Date(domain.lastVerified).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!domain.verified && (
                        <Button
                          onClick={() => handleVerifyDomain(domain.Id)}
                          variant="outline"
                          size="sm"
                          loading={saving}
                        >
                          Verify
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          setSelectedDomain(domain)
                          setShowAddRecord(true)
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <ApperIcon name="Plus" size={14} />
                      </Button>
                      <Button
                        onClick={() => handleDeleteDomain(domain.Id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <ApperIcon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </div>

                  {/* DNS Records */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">DNS Records</h4>
                    {domain.dnsRecords.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No DNS records configured
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">Type</th>
                              <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">Name</th>
                              <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">Value</th>
                              <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">TTL</th>
                              <th className="text-right py-2 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {domain.dnsRecords.map((record) => (
                              <tr key={record.Id} className="border-b border-gray-100 dark:border-gray-800">
                                <td className="py-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    record.type === 'A' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                    record.type === 'CNAME' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    record.type === 'TXT' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                  }`}>
                                    {record.type}
                                  </span>
                                </td>
                                <td className="py-2 text-gray-900 dark:text-gray-100">{record.name}</td>
                                <td className="py-2 text-gray-600 dark:text-gray-400 font-mono text-xs max-w-xs truncate">
                                  {record.value}
                                </td>
                                <td className="py-2 text-gray-600 dark:text-gray-400">{record.ttl}s</td>
                                <td className="py-2 text-right">
                                  <button
                                    onClick={() => handleDeleteDnsRecord(domain.Id, record.Id)}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    <ApperIcon name="Trash2" size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {domains.length === 0 && (
                <div className="card p-8 text-center">
                  <ApperIcon name="Globe" size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No domains configured
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Add your first custom domain to get started
                  </p>
                  <Button onClick={() => setShowAddDomain(true)}>
                    Add Domain
                  </Button>
                </div>
              )}
            </div>

            {/* Add Domain Modal */}
            {showAddDomain && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Add Domain
                    </h3>
                    <button
                      onClick={() => setShowAddDomain(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <ApperIcon name="X" size={20} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <Input
                      label="Domain Name"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      placeholder="example.com"
                    />
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddDomain(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddDomain}
                        loading={saving}
                        disabled={!newDomain.trim() || saving}
                      >
                        Add Domain
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add DNS Record Modal */}
            {showAddRecord && selectedDomain && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Add DNS Record
                    </h3>
                    <button
                      onClick={() => setShowAddRecord(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <ApperIcon name="X" size={20} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Record Type
                      </label>
                      <select
                        value={newRecord.type}
                        onChange={(e) => setNewRecord(prev => ({ ...prev, type: e.target.value }))}
                        className="input-field"
                      >
                        <option value="A">A</option>
                        <option value="CNAME">CNAME</option>
                        <option value="TXT">TXT</option>
                        <option value="MX">MX</option>
                      </select>
                    </div>
                    <Input
                      label="Name"
                      value={newRecord.name}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="@ or subdomain"
                    />
                    <Input
                      label="Value"
                      value={newRecord.value}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="IP address or target"
                    />
                    <Input
                      label="TTL (seconds)"
                      type="number"
                      value={newRecord.ttl}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, ttl: parseInt(e.target.value) || 3600 }))}
                      placeholder="3600"
                    />
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddRecord(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddDnsRecord}
                        loading={saving}
                        disabled={!newRecord.name || !newRecord.value || saving}
                      >
                        Add Record
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Settings