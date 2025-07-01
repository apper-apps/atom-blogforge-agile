import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const ThemeToggle = ({ darkMode, toggleDarkMode, className = '' }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleDarkMode}
      className={`p-2 rounded-lg transition-colors duration-200 ${
        darkMode 
          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: darkMode ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <ApperIcon name={darkMode ? 'Sun' : 'Moon'} size={18} />
      </motion.div>
    </motion.button>
  )
}

export default ThemeToggle