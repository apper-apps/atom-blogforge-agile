import { motion } from 'framer-motion'

const Loading = ({ type = 'default' }) => {
  if (type === 'dashboard') {
    return (
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card p-6"
            >
              <div className="skeleton h-8 w-3/4 mb-2 rounded"></div>
              <div className="skeleton h-12 w-1/2 rounded"></div>
            </motion.div>
          ))}
        </div>
        
        {/* Recent Posts */}
        <div className="card p-6">
          <div className="skeleton h-6 w-1/4 mb-4 rounded"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="skeleton h-16 w-16 rounded-lg"></div>
                <div className="flex-1">
                  <div className="skeleton h-4 w-3/4 mb-2 rounded"></div>
                  <div className="skeleton h-3 w-1/2 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (type === 'posts') {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="skeleton h-6 w-3/4 mb-2 rounded"></div>
                  <div className="skeleton h-4 w-1/2 mb-2 rounded"></div>
                  <div className="skeleton h-3 w-1/4 rounded"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="skeleton h-8 w-16 rounded"></div>
                  <div className="skeleton h-8 w-16 rounded"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'blog') {
    return (
      <div className="space-y-8">
        {[...Array(3)].map((_, i) => (
          <motion.article
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="card overflow-hidden"
          >
            <div className="skeleton h-48 w-full"></div>
            <div className="p-6">
              <div className="skeleton h-8 w-3/4 mb-3 rounded"></div>
              <div className="skeleton h-4 w-full mb-2 rounded"></div>
              <div className="skeleton h-4 w-2/3 mb-4 rounded"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="skeleton h-8 w-8 rounded-full"></div>
                  <div className="skeleton h-4 w-24 rounded"></div>
                </div>
                <div className="skeleton h-4 w-16 rounded"></div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-64">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"
      />
    </div>
  )
}

export default Loading