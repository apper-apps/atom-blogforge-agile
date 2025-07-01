import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import ShareButtons from '@/components/molecules/ShareButtons'
import { getPostBySlug, incrementPostViews } from '@/services/api/postsService'
import { getRelatedPosts } from '@/services/api/postsService'

const BlogPost = () => {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPost()
  }, [slug])

  useEffect(() => {
    if (post) {
      loadRelatedPosts()
      incrementPostViews(post.Id)
    }
  }, [post])

  const loadPost = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getPostBySlug(slug)
      setPost(data)
    } catch (err) {
      setError('Post not found')
    } finally {
      setLoading(false)
    }
  }

  const loadRelatedPosts = async () => {
    try {
      const data = await getRelatedPosts(post.Id, 3)
      setRelatedPosts(data)
    } catch (err) {
      console.error('Failed to load related posts:', err)
    }
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} />
  if (!post) return <Error message="Post not found" />

  const currentUrl = window.location.href

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-96 lg:h-[28rem] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={post.featuredImage || `https://images.unsplash.com/photo-${1500000000000 + post.Id * 1000000}-${post.Id * 1234567}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80`}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4">
              {post.title}
            </h1>
            <p className="text-xl text-gray-200 mb-6">
              {post.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-6 text-gray-200">
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
                <span>{post.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <ApperIcon name="Clock" size={16} />
                <span>{Math.ceil(post.content.split(' ').length / 200)} min read</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-blockquote:border-l-primary-500 prose-blockquote:bg-primary-50 dark:prose-blockquote:bg-primary-900/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg"
        >
          <div 
            className="whitespace-pre-wrap leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.contentWithLinks || post.content }}
          />
        </motion.div>
        {/* Keywords */}
        {post.keywords && post.keywords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {post.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 text-sm font-medium rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Share Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700"
        >
          <ShareButtons url={currentUrl} title={post.title} />
        </motion.div>
      </article>

      {/* Author Section */}
      <section className="bg-gray-50 dark:bg-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="card p-8"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <img
                src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'Author')}&background=2563eb&color=fff&size=80`}
                alt={post.author?.name}
                className="w-20 h-20 rounded-full"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {post.author?.name}
                </h3>
                {post.author?.designation && (
                  <p className="text-primary-600 dark:text-primary-400 font-medium">
                    {post.author?.designation}
                  </p>
                )}
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {post.author?.bio || 'Passionate writer and content creator sharing insights on technology and life.'}
                </p>
                {post.author?.socialLinks && (
                  <div className="flex items-center space-x-4 mt-4">
                    {Object.entries(post.author.socialLinks).map(([platform, url]) => (
                      url && (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <ApperIcon name={platform === 'twitter' ? 'Twitter' : platform === 'linkedin' ? 'Linkedin' : 'ExternalLink'} size={20} />
                        </a>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost, index) => (
                  <motion.article
                    key={relatedPost.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    className="card overflow-hidden group hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={relatedPost.featuredImage || `https://images.unsplash.com/photo-${1500000000000 + relatedPost.Id * 1000000}-${relatedPost.Id * 1234567}?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80`}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        <Link to={`/post/${relatedPost.slug}`}>
                          {relatedPost.title}
                        </Link>
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {relatedPost.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>{format(new Date(relatedPost.publishedAt), 'MMM d, yyyy')}</span>
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="Eye" size={14} />
                          <span>{relatedPost.views.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  )
}

export default BlogPost