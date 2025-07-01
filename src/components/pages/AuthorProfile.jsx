import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import { getAuthorById } from '@/services/api/authorsService'
import { getPostsByAuthor } from '@/services/api/postsService'

const AuthorProfile = () => {
  const { authorId } = useParams()
  const [author, setAuthor] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAuthorData()
  }, [authorId])

  const loadAuthorData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [authorData, postsData] = await Promise.all([
        getAuthorById(parseInt(authorId)),
        getPostsByAuthor(parseInt(authorId))
      ])
      
      setAuthor(authorData)
      setPosts(postsData)
    } catch (err) {
      setError('Author not found')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} />
  if (!author) return <Error message="Author not found" />

  return (
    <div className="min-h-screen">
      {/* Author Header */}
      <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <img
              src={author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=fff&color=2563eb&size=120`}
              alt={author.name}
              className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white shadow-lg"
            />
            
            <h1 className="text-4xl font-bold text-white mb-2">
              {author.name}
            </h1>
            
            {author.designation && (
              <p className="text-xl text-primary-100 mb-4">
                {author.designation}
              </p>
            )}
            
            <p className="text-lg text-primary-100 max-w-2xl mx-auto mb-6">
              {author.bio || 'Passionate writer and content creator sharing insights on technology and life.'}
            </p>
            
            <div className="flex items-center justify-center space-x-6 text-primary-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{posts.length}</p>
                <p className="text-sm">Articles</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {posts.reduce((total, post) => total + post.views, 0).toLocaleString()}
                </p>
                <p className="text-sm">Total Views</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {posts.length > 0 ? Math.round(posts.reduce((total, post) => total + post.views, 0) / posts.length).toLocaleString() : 0}
                </p>
                <p className="text-sm">Avg. Views</p>
              </div>
            </div>
            
            {author.socialLinks && (
              <div className="flex items-center justify-center space-x-4 mt-6">
                {Object.entries(author.socialLinks).map(([platform, url]) => (
                  url && (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                      <ApperIcon 
                        name={platform === 'twitter' ? 'Twitter' : platform === 'linkedin' ? 'Linkedin' : 'ExternalLink'} 
                        size={20} 
                        className="text-white"
                      />
                    </a>
                  )
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Author's Posts */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
              Articles by {author.name}
            </h2>
            
            {posts.length === 0 ? (
              <Empty
                title="No articles published"
                description={`${author.name} hasn't published any articles yet`}
                icon="FileText"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => (
                  <motion.article
                    key={post.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="card overflow-hidden group hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.featuredImage || `https://images.unsplash.com/photo-${1500000000000 + post.Id * 1000000}-${post.Id * 1234567}?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80`}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
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
                      
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        <Link to={`/post/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <Link
                        to={`/post/${post.slug}`}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm"
                      >
                        Read More →
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default AuthorProfile