import { createContext, useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { setUser, clearUser } from '@/store/userSlice'
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
import Calendar from '@/components/pages/Calendar'
import Login from '@/components/pages/Login'
import Signup from '@/components/pages/Signup'
import Callback from '@/components/pages/Callback'
import ErrorPage from '@/components/pages/ErrorPage'
import ResetPassword from '@/components/pages/ResetPassword'
import PromptPassword from '@/components/pages/PromptPassword'
import { generateRSSFeed } from '@/services/api/rssService'

// Create auth context
export const AuthContext = createContext(null)

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
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [darkMode, setDarkMode] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Get authentication status with proper error handling
  const userState = useSelector((state) => state.user)
  const isAuthenticated = userState?.isAuthenticated || false

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

  // Initialize ApperUI once when the app loads
  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK
    
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    
    // Initialize but don't show login yet
    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        setIsInitialized(true)
        // CRITICAL: This exact currentPath logic must be preserved in all implementations
        // DO NOT simplify or modify this pattern as it ensures proper redirection flow
        let currentPath = window.location.pathname + window.location.search
        let redirectPath = new URLSearchParams(window.location.search).get('redirect')
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || 
                           currentPath.includes('/callback') || currentPath.includes('/error') || 
                           currentPath.includes('/prompt-password') || currentPath.includes('/reset-password')
        
        if (user) {
          // User is authenticated
          if (redirectPath) {
            navigate(redirectPath)
          } else if (!isAuthPage) {
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              navigate(currentPath)
            } else {
              navigate('/admin')
            }
          } else {
            navigate('/admin')
          }
          // Store user information in Redux
          dispatch(setUser(JSON.parse(JSON.stringify(user))))
        } else {
          // User is not authenticated
          if (!isAuthPage) {
            navigate(
              currentPath.includes('/signup')
                ? `/signup?redirect=${currentPath}`
                : currentPath.includes('/login')
                ? `/login?redirect=${currentPath}`
                : '/login'
            )
          } else if (redirectPath) {
            if (
              !['error', 'signup', 'login', 'callback', 'prompt-password', 'reset-password'].some((path) => currentPath.includes(path))
            ) {
              navigate(`/login?redirect=${redirectPath}`)
            } else {
              navigate(currentPath)
            }
          } else if (isAuthPage) {
            navigate(currentPath)
          } else {
            navigate('/login')
          }
          dispatch(clearUser())
        }
      },
      onError: function(error) {
        console.error("Authentication failed:", error)
        setIsInitialized(true)
      }
    })
  }, [])// No props and state should be bound
  
  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK
        await ApperUI.logout()
        dispatch(clearUser())
        navigate('/login')
      } catch (error) {
        console.error("Logout failed:", error)
      }
    }
  }
  
  // Don't render routes until initialization is complete
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Initializing application...</p>
        </div>
      </div>
    )
  }
  
  return (
    <AuthContext.Provider value={authMethods}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/prompt-password/:appId/:emailAddress/:provider" element={<PromptPassword />} />
          <Route path="/reset-password/:appId/:fields" element={<ResetPassword />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
            <Route index element={<Dashboard />} />
            <Route path="posts" element={<PostList />} />
            <Route path="posts/new" element={<PostEditor />} />
            <Route path="posts/edit/:id" element={<PostEditor />} />
            <Route path="templates" element={<Templates />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="calendar" element={<Calendar />} />
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
    </AuthContext.Provider>
  )
}

export default App