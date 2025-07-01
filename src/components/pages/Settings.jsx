import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import { getBlogSettings, updateBlogSettings } from '@/services/api/settingsService'

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
      facebookPixel: ''
    },
    theme: {
      primaryColor: '#2563eb',
      accentColor: '#7c3aed',
      darkMode: false
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
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

  const tabs = [
    { id: 'general', label: 'General', icon: 'Settings' },
    { id: 'social', label: 'Social Media', icon: 'Share2' },
    { id: 'seo', label: 'SEO', icon: 'Search' },
    { id: 'theme', label: 'Theme', icon: 'Palette' }
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
      </motion.div>
    </div>
  )
}

export default Settings