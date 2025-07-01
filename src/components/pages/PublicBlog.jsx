import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import SearchBar from '@/components/molecules/SearchBar'
import Badge from '@/components/atoms/Badge'
import { getPublishedPosts } from '@/services/api/postsService'

const PublicBlog = () => {
  const [posts, setPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [featuredPost, setFeaturedPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadPosts()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [posts, searchQuery])

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getPublishedPosts()
      setPosts(data)
      setFeaturedPost(data.find(post => post.featured) || data[0])
    } catch (err) {
      setError('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const filterPosts = () => {
    let filtered = posts.filter(post => post.Id !== featuredPost?.Id)

    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredPosts(filtered)
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  if (loading) return <Loading type="blog" />
  if (error) return <Error message={error} onRetry={loadPosts} />

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {featuredPost && (
        <section className="relative h-96 lg:h-[32rem] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={featuredPost.featuredImage || 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'}
              alt={featuredPost.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Badge variant="primary" className="mb-4">Featured Post</Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
                {featuredPost.title}
              </h1>
              <p className="text-xl text-gray-200 mb-6 line-clamp-3">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center space-x-6 text-gray-200">
                <div className="flex items-center space-x-2">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(featuredPost.author?.name || 'Author')}&background=2563eb&color=fff&size=32`}
                    alt={featuredPost.author?.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium">{featuredPost.author?.name}</span>
                </div>
                <span>{format(new Date(featuredPost.publishedAt), 'MMMM d, yyyy')}</span>
                <div className="flex items-center space-x-1">
                  <ApperIcon name="Eye" size={16} />
                  <span>{featuredPost.views.toLocaleString()}</span>
                </div>
              </div>
              <Link
                to={`/post/${featuredPost.slug}`}
                className="inline-flex items-center mt-8 px-6 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Read More
                <ApperIcon name="ArrowRight" size={16} className="ml-2" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="mb-12 max-w-md mx-auto">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search articles..."
            className="w-full"
          />
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <Empty
            title="No posts found"
            description={searchQuery ? "Try adjusting your search terms" : "No blog posts have been published yet"}
            icon="FileText"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card overflow-hidden group hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.featuredImage || `https://images.unsplash.com/photo-${1500000000000 + post.Id * 1000000}-${post.Id * 1234567}?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80`}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <ApperIcon name="Calendar" size={14} />
                      <span>{format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                      <ApperIcon name="Eye" size={14} />
                      <span>{post.views.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    <Link to={`/post/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'Author')}&background=2563eb&color=fff&size=24`}
                        alt={post.author?.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {post.author?.name}
                      </span>
                    </div>
                    
                    <Link
                      to={`/post/${post.slug}`}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default PublicBlog