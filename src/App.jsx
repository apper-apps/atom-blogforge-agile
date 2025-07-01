import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/organisms/AdminLayout'
import PublicLayout from '@/components/organisms/PublicLayout'
import Dashboard from '@/components/pages/Dashboard'
import PostList from '@/components/pages/PostList'
import PostEditor from '@/components/pages/PostEditor'
import Templates from '@/components/pages/Templates'
import Analytics from '@/components/pages/Analytics'
import Settings from '@/components/pages/Settings'
import MediaLibrary from '@/components/pages/MediaLibrary'
import PublicBlog from '@/components/pages/PublicBlog'
import BlogPost from '@/components/pages/BlogPost'
import AuthorProfile from '@/components/pages/AuthorProfile'
import { generateRSSFeed } from '@/services/api/rssService'

// RSS Feed Handler Component
const RSSFeedHandler = () => {
  useEffect(() => {
    const serveRSSFeed = async () => {
      try {
        const rssXml = await generateRSSFeed()
        
        // Create a blob with the RSS XML content
        const blob = new Blob([rssXml], { type: 'application/rss+xml; charset=utf-8' })
        const url = URL.createObjectURL(blob)
        
        // Replace current page with RSS feed
        window.location.replace(url)
      } catch (error) {
        console.error('Failed to generate RSS feed:', error)
        // Fallback: serve basic RSS structure
        const fallbackRSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>TechBlog - Latest Posts</title>
    <description>RSS feed temporarily unavailable</description>
    <link>${window.location.origin}</link>
  </channel>
</rss>`
        const blob = new Blob([fallbackRSS], { type: 'application/rss+xml; charset=utf-8' })
        const url = URL.createObjectURL(blob)
        window.location.replace(url)
      }
    }
    
    serveRSSFeed()
  }, [])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Generating RSS feed...</p>
      </div>
    </div>
  )
}

function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    document.documentElement.classList.toggle('dark', newDarkMode)
  }

return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
          <Route index element={<Dashboard />} />
          <Route path="posts" element={<PostList />} />
          <Route path="posts/new" element={<PostEditor />} />
          <Route path="posts/edit/:id" element={<PostEditor />} />
          <Route path="templates" element={<Templates />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* Public Blog Routes */}
        <Route path="/" element={<PublicLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
          <Route index element={<PublicBlog />} />
          <Route path="post/:slug" element={<BlogPost />} />
          <Route path="author/:authorId" element={<AuthorProfile />} />
          <Route path="rss.xml" element={<RSSFeedHandler />} />
        </Route>
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? 'dark' : 'light'}
        style={{ zIndex: 9999 }}
      />
    </div>
  )
}

export default App