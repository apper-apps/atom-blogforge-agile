import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import ApperIcon from '@/components/ApperIcon'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import SearchBar from '@/components/molecules/SearchBar'
import Badge from '@/components/atoms/Badge'
import { getPublishedPosts, getPostsByCategory } from '@/services/api/postsService'

const PublicBlog = () => {
  const [posts, setPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [featuredPosts, setFeaturedPosts] = useState([])
  const [categoryPosts, setCategoryPosts] = useState({})
  const [loading, setLoading] = useState(true)
  const [categoryLoading, setCategoryLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
useEffect(() => {
    loadPosts()
    loadCategoryPosts()
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
      
      // Get featured posts for slider (fallback to first 3 posts if none are featured)
      const featured = data.filter(post => post.featured)
      if (featured.length === 0) {
        setFeaturedPosts(data.slice(0, 3))
      } else {
        setFeaturedPosts(featured)
      }
    } catch (err) {
      setError('Failed to load posts')
    } finally {
      setLoading(false)
    }
}

  const loadCategoryPosts = async () => {
    try {
      setCategoryLoading(true)
      const categories = ['Technology', 'Lifestyle', 'Business', 'Finance', 'Health']
      const categoryData = {}
      
      for (const category of categories) {
        const posts = await getPostsByCategory(category, 5)
        if (posts.length > 0) {
          categoryData[category] = posts
        }
      }
      
      setCategoryPosts(categoryData)
    } catch (err) {
      console.warn('Failed to load category posts:', err)
    } finally {
      setCategoryLoading(false)
    }
  }
const filterPosts = () => {
    // Filter out featured posts from the main grid
    const featuredIds = featuredPosts.map(post => post.Id)
    let filtered = posts.filter(post => !featuredIds.includes(post.Id))

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
      {/* Hero Section with Slider */}
      {featuredPosts.length > 0 && (
        <section className="relative h-96 lg:h-[32rem] overflow-hidden">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            pagination={{
              el: '.swiper-pagination-custom',
              clickable: true,
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            loop={featuredPosts.length > 1}
            className="w-full h-full"
          >
            {featuredPosts.map((post, index) => (
              <SwiperSlide key={post.Id}>
                <div className="relative w-full h-full">
                  <div className="absolute inset-0">
                    <img
                      src={post.featuredImage || `https://images.unsplash.com/photo-${1500000000000 + post.Id * 1000000}-${post.Id * 1234567}?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80`}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
                  </div>
                  
                  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="max-w-3xl"
                    >
                      <Badge variant="primary" className="mb-4">
                        {post.category || 'Featured Post'}
                      </Badge>
                      <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
                        {post.title}
                      </h1>
                      <p className="text-xl text-gray-200 mb-6 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center space-x-6 text-gray-200 mb-8">
                        <div className="flex items-center space-x-2">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'Author')}&background=2563eb&color=fff&size=32`}
                            alt={post.author?.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="font-medium">{post.author?.name}</span>
                        </div>
                        <span>{format(new Date(post.publishedAt), 'MMMM d, yyyy')}</span>
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="Eye" size={16} />
                          <span>{post.views.toLocaleString()}</span>
                        </div>
                      </div>
                      <Link
                        to={`/post/${post.slug}`}
                        className="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Read More
                        <ApperIcon name="ArrowRight" size={16} className="ml-2" />
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          {/* Navigation Controls */}
          {featuredPosts.length > 1 && (
            <>
              <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <ApperIcon name="ChevronLeft" size={24} />
              </button>
              <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <ApperIcon name="ChevronRight" size={24} />
              </button>
              <div className="swiper-pagination-custom absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex space-x-2"></div>
            </>
          )}
        </section>
      )}
{/* Category Boxes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Explore by Category
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Discover our latest articles organized by topics that matter most to you
          </p>
        </div>

        {categoryLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="card p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex space-x-3">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {Object.entries(categoryPosts).map(([category, posts]) => {
              const featuredPost = posts[0]
              const latestPosts = posts.slice(1, 5)
              
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="card overflow-hidden group hover:shadow-2xl transition-all duration-300"
                >
                  {/* Category Header */}
                  <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {category}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {posts.length} article{posts.length !== 1 ? 's' : ''} available
                    </p>
                  </div>

                  {/* Featured Post */}
                  {featuredPost && (
                    <div className="p-6 pb-4">
                      <Link to={`/post/${featuredPost.slug}`} className="block group/featured">
                        <div className="relative h-32 mb-4 overflow-hidden rounded-lg">
                          <img
                            src={featuredPost.featuredImage || `https://images.unsplash.com/photo-${1500000000000 + featuredPost.Id * 1000000}-${featuredPost.Id * 1234567}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`}
                            alt={featuredPost.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/featured:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover/featured:text-primary-600 dark:group-hover/featured:text-primary-400 transition-colors line-clamp-2">
                          {featuredPost.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {featuredPost.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(featuredPost.author?.name || 'Author')}&background=2563eb&color=fff&size=20`}
                              alt={featuredPost.author?.name}
                              className="w-5 h-5 rounded-full"
                            />
                            <span>{featuredPost.author?.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ApperIcon name="Eye" size={12} />
                            <span>{featuredPost.views.toLocaleString()}</span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )}

                  {/* Latest Posts */}
                  {latestPosts.length > 0 && (
                    <div className="px-6 pb-6">
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Latest Articles
                        </h5>
                        <div className="space-y-3">
                          {latestPosts.map((post) => (
                            <Link
                              key={post.Id}
                              to={`/post/${post.slug}`}
                              className="flex items-start space-x-3 group/latest hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 -m-2 transition-colors"
                            >
                              <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded">
                                <img
                                  src={post.featuredImage || `https://images.unsplash.com/photo-${1500000000000 + post.Id * 1000000}-${post.Id * 1234567}?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80`}
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover/latest:text-primary-600 dark:group-hover/latest:text-primary-400 transition-colors line-clamp-2 mb-1">
                                  {post.title}
                                </h6>
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                  <span>{format(new Date(post.publishedAt), 'MMM d')}</span>
                                  <div className="flex items-center space-x-1">
                                    <ApperIcon name="Eye" size={10} />
                                    <span>{post.views}</span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </section>

      {/* Main Content */}
      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* RSS Feed Link */}
        <div className="mb-8 text-center">
          <a
            href="/rss.xml"
            className="inline-flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            <ApperIcon name="Rss" size={16} />
            <span>Subscribe to RSS Feed</span>
          </a>
        </div>

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