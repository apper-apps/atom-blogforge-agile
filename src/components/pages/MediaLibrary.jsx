import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import { getAllMedia, uploadMedia, deleteMedia } from '@/services/api/mediaService'

const MediaLibrary = () => {
  const [media, setMedia] = useState([])
  const [filteredMedia, setFilteredMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    loadMedia()
  }, [])

  useEffect(() => {
    filterMedia()
  }, [media, searchTerm, filterType])

  const loadMedia = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getAllMedia()
      setMedia(data)
    } catch (err) {
      setError('Failed to load media files')
    } finally {
      setLoading(false)
    }
  }

  const filterMedia = () => {
    let filtered = media

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.alt?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType)
    }

    setFilteredMedia(filtered)
  }

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return
    
    try {
      setUploading(true)
      
      for (const file of acceptedFiles) {
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Maximum size is 10MB.`)
          continue
        }

        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && file.type !== 'application/pdf') {
          toast.error(`File ${file.name} is not supported. Only images, videos, and PDFs are allowed.`)
          continue
        }

        const uploadedMedia = await uploadMedia(file)
        setMedia(prev => [uploadedMedia, ...prev])
        toast.success(`${file.name} uploaded successfully`)
      }
    } catch (err) {
      toast.error('Failed to upload files')
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.ogg'],
      'application/pdf': ['.pdf']
    },
    multiple: true
  })

  const handleDelete = async (mediaItem) => {
    try {
      await deleteMedia(mediaItem.Id)
      setMedia(prev => prev.filter(item => item.Id !== mediaItem.Id))
      setDeleteConfirm(null)
      toast.success('Media deleted successfully')
    } catch (err) {
      toast.error('Failed to delete media')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getMediaIcon = (type) => {
    if (type.startsWith('image/')) return 'Image'
    if (type.startsWith('video/')) return 'Video'
    if (type === 'application/pdf') return 'FileText'
    return 'File'
  }

  if (loading) return <Loading type="page" />
  if (error) return <Error message={error} onRetry={loadMedia} />

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Media Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload and manage your media files for blog posts
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredMedia.length} of {media.length} files
          </span>
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
          isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <ApperIcon name={uploading ? 'Loader2' : 'Upload'} size={32} className={`text-gray-500 ${uploading ? 'animate-spin' : ''}`} />
          </div>
          
          {uploading ? (
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Uploading files...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please wait while we process your files
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {isDragActive ? 'Drop files here' : 'Drop files or click to upload'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Supports images, videos, and PDFs up to 10MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search media files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="Search"
          />
        </div>
        
        <div className="flex gap-2">
          {['all', 'image', 'video', 'document'].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterType(type)}
              className="capitalize"
            >
              {type === 'all' ? 'All Files' : `${type}s`}
            </Button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <Empty
          title={media.length === 0 ? "No media files" : "No files match your search"}
          description={media.length === 0 ? "Upload your first media file to get started" : "Try adjusting your search or filter criteria"}
          actionLabel={media.length === 0 ? "Upload Files" : "Clear Filters"}
          onAction={media.length === 0 ? () => document.querySelector('input[type="file"]').click() : () => {
            setSearchTerm('')
            setFilterType('all')
          }}
          icon="Image"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <AnimatePresence>
            {filteredMedia.map((item) => (
              <motion.div
                key={item.Id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                className="card p-4 cursor-pointer"
                onClick={() => setSelectedMedia(item)}
              >
                <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {item.type.startsWith('image/') ? (
                    <img
                      src={item.url}
                      alt={item.alt || item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ApperIcon name={getMediaIcon(item.type)} size={48} className="text-gray-400" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate" title={item.name}>
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatFileSize(item.size)}</span>
                    <span className="capitalize">{item.type.split('/')[0]}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Media Detail Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Media Details
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon="Trash2"
                    onClick={() => {
                      setDeleteConfirm(selectedMedia)
                      setSelectedMedia(null)
                    }}
                  >
                    Delete
                  </Button>
                  <button
                    onClick={() => setSelectedMedia(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <ApperIcon name="X" size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg aspect-square">
                    {selectedMedia.type.startsWith('image/') ? (
                      <img
                        src={selectedMedia.url}
                        alt={selectedMedia.alt || selectedMedia.name}
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    ) : (
                      <ApperIcon name={getMediaIcon(selectedMedia.type)} size={96} className="text-gray-400" />
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        File Name
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">{selectedMedia.name}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        File Size
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">{formatFileSize(selectedMedia.size)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        File Type
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">{selectedMedia.type}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Upload Date
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {new Date(selectedMedia.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        URL
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={selectedMedia.url}
                          readOnly
                          className="flex-1 input-field text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          icon="Copy"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedMedia.url)
                            toast.success('URL copied to clipboard')
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <ApperIcon name="Trash2" size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Delete Media
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to delete "{deleteConfirm.name}"? This will remove the file permanently.
              </p>
              
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleDelete(deleteConfirm)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MediaLibrary