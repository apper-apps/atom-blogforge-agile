import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const Empty = ({ 
  title = "No content yet", 
  description = "Get started by creating your first item",
  actionLabel = "Create New",
  onAction,
  icon = "FileText"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-64 p-8 text-center"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mb-6">
        <ApperIcon name={icon} size={32} className="text-gray-400 dark:text-gray-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        {description}
      </p>
      
      {onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="btn-primary inline-flex items-center"
        >
          <ApperIcon name="Plus" size={16} className="mr-2" />
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  )
}

export default Empty