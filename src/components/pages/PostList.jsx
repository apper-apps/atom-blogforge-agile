import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import SearchBar from '@/components/molecules/SearchBar'
import PostCard from '@/components/molecules/PostCard'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import { getAllPosts, deletePost } from '@/services/api/postsService'

const PostList = () => {
  const [posts, setPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const navigate = useNavigate()

  useEffect(() => {
    loadPosts()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [posts, searchQuery, statusFilter])

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getAllPosts()
      setPosts(data)
    } catch (err) {
      setError('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const filterPosts = () => {
    let filtered = posts

    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter)
    }

    setFilteredPosts(filtered)
  }

  const handleEdit = (post) => {
    navigate(`/admin/posts/edit/${post.Id}`)
  }

  const handleDelete = async (post) => {
    if (window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      try {
        await deletePost(post.Id)
        toast.success('Post deleted successfully')
        loadPosts()
      } catch (err) {
        toast.error('Failed to delete post')
      }
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  if (loading) return <Loading type="posts" />
  if (error) return <Error message={error} onRetry={loadPosts} />

  const statusCounts = {
    all: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
    archived: posts.filter(p => p.status === 'archived').length
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Posts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your blog posts
          </p>
        </div>
        
        <Link to="/admin/posts/new" className="btn-primary">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search posts..."
              className="max-w-md"
            />
          </div>
          
          <div className="flex items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === status
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                </button>
              ))}
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-400'}`}
              >
                <ApperIcon name="Grid3X3" size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-400'}`}
              >
                <ApperIcon name="List" size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      {filteredPosts.length === 0 ? (
        <Empty
          title="No posts found"
          description={searchQuery ? "Try adjusting your search criteria" : "Create your first blog post to get started"}
          actionLabel="Create Post"
          onAction={() => navigate('/admin/posts/new')}
          icon="FileText"
        />
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {filteredPosts.map((post) => (
            viewMode === 'grid' ? (
              <PostCard
                key={post.Id}
                post={post}
                showActions={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <motion.div
                key={post.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {post.title}
                      </h3>
                      <Badge variant={post.status === 'published' ? 'success' : post.status === 'draft' ? 'warning' : 'default'}>
                        {post.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <ApperIcon name="Eye" size={14} className="mr-1" />
                        {post.views.toLocaleString()} views
                      </span>
                      <span className="flex items-center">
                        <ApperIcon name="Calendar" size={14} className="mr-1" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(post)}
                      icon="Edit"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post)}
                      icon="Trash2"
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          ))}
        </div>
      )}
    </div>
  )
}

export default PostList