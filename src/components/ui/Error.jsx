import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const Error = ({ message = "Something went wrong", onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-64 p-8 text-center"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4">
        <ApperIcon name="AlertTriangle" size={24} className="text-white" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Oops! Something went wrong
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        {message}
      </p>
      
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="btn-primary inline-flex items-center"
        >
          <ApperIcon name="RefreshCw" size={16} className="mr-2" />
          Try Again
        </motion.button>
      )}
    </motion.div>
  )
}

export default Error