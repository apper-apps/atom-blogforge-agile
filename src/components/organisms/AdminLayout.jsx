import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import ThemeToggle from '@/components/molecules/ThemeToggle'

const AdminLayout = ({ children, darkMode, toggleDarkMode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: 'BarChart3' },
    { name: 'Posts', href: '/admin/posts', icon: 'FileText' },
    { name: 'Analytics', href: '/admin/analytics', icon: 'TrendingUp' },
    { name: 'Settings', href: '/admin/settings', icon: 'Settings' },
  ]

  const isActive = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -320 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-xl lg:translate-x-0 lg:static lg:inset-0"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <Link to="/admin" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <ApperIcon name="PenTool" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">BlogForge</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Admin Panel</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>

        <nav className="px-6 py-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ApperIcon name={item.icon} size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ApperIcon name="ExternalLink" size={20} />
            <span>View Blog</span>
          </Link>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:ml-80">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ApperIcon name="Menu" size={24} />
            </button>
            
            <div className="flex items-center space-x-4 ml-auto">
              <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              
              <div className="flex items-center space-x-3">
                <img
                  src="https://ui-avatars.com/api/?name=Admin&background=2563eb&color=fff&size=32"
                  alt="Admin"
                  className="w-8 h-8 rounded-full"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Admin User
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Administrator
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout