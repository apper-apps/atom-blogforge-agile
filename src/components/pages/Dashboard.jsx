import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import PostCard from '@/components/molecules/PostCard'
import { getAnalytics } from '@/services/api/analyticsService'
import { getRecentPosts } from '@/services/api/postsService'

const Dashboard = () => {
  const [analytics, setAnalytics] = useState([])
  const [recentPosts, setRecentPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [analyticsData, postsData] = await Promise.all([
        getAnalytics(),
        getRecentPosts(5)
      ])
      
      setAnalytics(analyticsData)
      setRecentPosts(postsData)
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading type="dashboard" />
  if (error) return <Error message={error} onRetry={loadDashboardData} />

  const stats = [
    {
      title: 'Total Posts',
      value: analytics.totalPosts || 0,
      change: '+12%',
      icon: 'FileText',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Total Views',
      value: (analytics.totalViews || 0).toLocaleString(),
      change: '+23%',
      icon: 'Eye',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'This Month',
      value: (analytics.monthlyViews || 0).toLocaleString(),
      change: '+8%',
      icon: 'TrendingUp',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Avg. Views/Post',
      value: (analytics.avgViewsPerPost || 0).toLocaleString(),
      change: '+15%',
      icon: 'BarChart3',
      color: 'from-orange-500 to-orange-600'
    }
  ]

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your blog.
          </p>
        </div>
        
        <Link
          to="/admin/posts/new"
          className="btn-primary inline-flex items-center"
        >
          <ApperIcon name="Plus" size={16} className="mr-2" />
          New Post
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {stat.value}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {stat.change} from last month
                </p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                <ApperIcon name={stat.icon} size={24} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Recent Posts
          </h2>
          <Link
            to="/admin/posts"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm"
          >
            View All
          </Link>
        </div>
        
        {recentPosts.length === 0 ? (
          <Empty
            title="No posts yet"
            description="Create your first blog post to get started"
            actionLabel="Create Post"
            onAction={() => window.location.href = '/admin/posts/new'}
            icon="FileText"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <PostCard
                key={post.Id}
                post={post}
                showActions={true}
                onEdit={(post) => window.location.href = `/admin/posts/edit/${post.Id}`}
                onDelete={(post) => console.log('Delete:', post)}
              />
            ))}
          </div>
        )}
      </div>

{/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card p-6 cursor-pointer"
          onClick={() => window.location.href = '/admin/posts/new'}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <ApperIcon name="Plus" size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Create New Post
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Start writing your next blog post
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card p-6 cursor-pointer"
          onClick={() => window.location.href = '/admin/media'}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
              <ApperIcon name="Image" size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Media Library
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload and manage media files
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card p-6 cursor-pointer"
          onClick={() => window.location.href = '/admin/analytics'}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <ApperIcon name="BarChart3" size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                View Analytics
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Check your blog performance
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card p-6 cursor-pointer"
          onClick={() => window.location.href = '/admin/settings'}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ApperIcon name="Settings" size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Blog Settings
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Customize your blog appearance
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard