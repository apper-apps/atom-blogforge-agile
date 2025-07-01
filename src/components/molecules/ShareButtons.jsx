import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import { toast } from 'react-toastify'

const ShareButtons = ({ url, title, className = '' }) => {
  const shareOptions = [
    {
      name: 'Twitter',
      icon: 'Twitter',
      color: 'bg-blue-500 hover:bg-blue-600',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
    },
    {
      name: 'Facebook',
      icon: 'Facebook',
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      name: 'LinkedIn',
      icon: 'Linkedin',
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    },
    {
      name: 'WhatsApp',
      icon: 'MessageCircle',
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`
    }
  ]

  const handleShare = (shareUrl) => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
        Share:
      </span>
      
      {shareOptions.map((option, index) => (
        <motion.button
          key={option.name}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => handleShare(option.url)}
          className={`p-2 text-white rounded-lg transition-colors duration-200 ${option.color}`}
          title={`Share on ${option.name}`}
        >
          <ApperIcon name={option.icon} size={16} />
        </motion.button>
      ))}
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        onClick={handleCopyLink}
        className="p-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
        title="Copy link"
      >
        <ApperIcon name="Link" size={16} />
      </motion.button>
    </div>
  )
}

export default ShareButtons