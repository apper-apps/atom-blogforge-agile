import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/organisms/AdminLayout'
import PublicLayout from '@/components/organisms/PublicLayout'
import Dashboard from '@/components/pages/Dashboard'
import PostList from '@/components/pages/PostList'
import PostEditor from '@/components/pages/PostEditor'
import Analytics from '@/components/pages/Analytics'
import Settings from '@/components/pages/Settings'
import MediaLibrary from '@/components/pages/MediaLibrary'
import PublicBlog from '@/components/pages/PublicBlog'
import BlogPost from '@/components/pages/BlogPost'
import AuthorProfile from '@/components/pages/AuthorProfile'

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
        <Route path="/admin/*" element={
          <AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
<Routes>
              <Route index element={<Dashboard />} />
              <Route path="posts" element={<PostList />} />
              <Route path="posts/new" element={<PostEditor />} />
              <Route path="posts/edit/:id" element={<PostEditor />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Routes>
          </AdminLayout>
        } />
        
        {/* Public Blog Routes */}
        <Route path="/*" element={
          <PublicLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
            <Routes>
              <Route index element={<PublicBlog />} />
              <Route path="post/:slug" element={<BlogPost />} />
              <Route path="author/:authorId" element={<AuthorProfile />} />
            </Routes>
          </PublicLayout>
        } />
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