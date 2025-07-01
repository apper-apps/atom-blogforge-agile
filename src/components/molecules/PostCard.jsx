import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Badge from '@/components/atoms/Badge'

const PostCard = ({ post, showActions = false, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success'
      case 'draft': return 'warning'
      case 'archived': return 'default'
      default: return 'default'
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="card overflow-hidden group"
    >
      {post.featuredImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge variant={getStatusColor(post.status)} size="sm">
            {post.status}
          </Badge>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <ApperIcon name="Eye" size={14} className="mr-1" />
            {post.views.toLocaleString()}
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          <Link to={showActions ? `/admin/posts/edit/${post.Id}` : `/post/${post.slug}`}>
            {post.title}
          </Link>
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'Author')}&background=2563eb&color=fff&size=32`}
              alt={post.author?.name}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {post.author?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(post.publishedAt || post.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(post)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <ApperIcon name="Edit" size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(post)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <ApperIcon name="Trash2" size={16} />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  )
}

export default PostCard