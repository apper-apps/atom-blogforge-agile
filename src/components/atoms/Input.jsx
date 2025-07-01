import { forwardRef } from 'react'
import ApperIcon from '@/components/ApperIcon'

const Input = forwardRef(({ 
  label,
  error,
  hint,
  icon,
  type = 'text',
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ApperIcon name={icon} size={18} className="text-gray-400" />
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={`input-field ${icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
          <ApperIcon name="AlertCircle" size={14} className="mr-1" />
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input