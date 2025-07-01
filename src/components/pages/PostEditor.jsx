import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Settings from "@/components/pages/Settings";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import { createPost, getPostById, updatePost } from "@/services/api/postsService";

const PostEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  
const [post, setPost] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    status: 'draft',
    scheduledPublishAt: '',
    authorId: 1
  })
const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [keywordInput, setKeywordInput] = useState('')
  const [showMediaBrowser, setShowMediaBrowser] = useState(false)

  useEffect(() => {
    if (isEdit) {
      loadPost()
    }
  }, [id, isEdit])

  useEffect(() => {
    if (post.title && !isEdit) {
      setPost(prev => ({
        ...prev,
        slug: generateSlug(prev.title),
        metaTitle: prev.title
      }))
    }
  }, [post.title, isEdit])

  const loadPost = async () => {
    try {
      setLoading(true)
      const data = await getPostById(parseInt(id))
      setPost(data)
    } catch (err) {
      toast.error('Failed to load post')
      navigate('/admin/posts')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleInputChange = (field, value) => {
    setPost(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !post.keywords.includes(keywordInput.trim())) {
      setPost(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }))
      setKeywordInput('')
    }
  }

  const handleRemoveKeyword = (keyword) => {
    setPost(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  const handleSave = async (status = post.status) => {
    if (!post.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (!post.content.trim()) {
      toast.error('Please enter some content')
      return
    }

    try {
setSaving(true)
      
      const postData = {
        ...post,
        status,
        publishedAt: status === 'published' ? new Date().toISOString() : post.publishedAt,
        scheduledPublishAt: status === 'scheduled' ? post.scheduledPublishAt : null
      }
      if (isEdit) {
        await updatePost(parseInt(id), postData)
        toast.success('Post updated successfully')
      } else {
        await createPost(postData)
        toast.success('Post created successfully')
      }
      
      navigate('/admin/posts')
    } catch (err) {
      toast.error('Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {isEdit ? 'Edit Post' : 'Create New Post'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEdit ? 'Update your blog post' : 'Write and publish your blog post'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPreview(!preview)}
            icon={preview ? 'Edit' : 'Eye'}
          >
            {preview ? 'Edit' : 'Preview'}
          </Button>
          
          <Button
            onClick={() => handleSave('draft')}
            loading={saving}
            disabled={saving}
            variant="outline"
          >
            Save Draft
          </Button>
          
          <Button
            onClick={() => handleSave('published')}
            loading={saving}
            disabled={saving}
          >
            {post.status === 'published' ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {!preview ? (
            <>
              {/* Title */}
              <div className="card p-6">
                <Input
                  label="Title"
                  value={post.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter your post title..."
                  className="text-2xl font-bold"
                />
              </div>
{/* Featured Image */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Featured Image
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    icon="Image"
                    onClick={() => setShowMediaBrowser(true)}
                  >
                    Browse Media
                  </Button>
                </div>
                <Input
                  value={post.featuredImage}
                  onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                  placeholder="https://example.com/image.jpg or select from media library"
                />
                {post.featuredImage && (
                  <div className="mt-4">
                    <img
                      src={post.featuredImage}
                      alt="Featured"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="card p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={post.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={20}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                  placeholder="Write your post content here..."
                />
              </div>

              {/* Excerpt */}
              <div className="card p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={post.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="Brief description of your post..."
                />
              </div>
            </>
          ) : (
            /* Preview */
            <div className="card p-8">
              <article className="prose prose-lg max-w-none dark:prose-invert">
                {post.featuredImage && (
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-64 object-cover rounded-lg mb-8"
                  />
                )}
                
                <h1 className="text-4xl font-bold mb-4">{post.title || 'Untitled Post'}</h1>
                
                {post.excerpt && (
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 italic">
                    {post.excerpt}
                  </p>
                )}
                
                <div className="whitespace-pre-wrap">
                  {post.content || 'No content yet...'}
                </div>
              </article>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
{/* Status */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Status
            </h3>
            <div className="space-y-2">
              {['draft', 'published', 'scheduled', 'archived'].map((status) => (
                <label key={status} className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={post.status === status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="mr-2"
                  />
                  <span className="capitalize">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Scheduling */}
          {post.status === 'scheduled' && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Schedule Publication
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Publish Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={post.scheduledPublishAt ? new Date(post.scheduledPublishAt).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('scheduledPublishAt', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="input-field"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Post will be automatically published at the scheduled time
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SEO */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              SEO Settings
            </h3>
            <div className="space-y-4">
              <Input
                label="Slug"
                value={post.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="post-slug"
              />
              
              <Input
                label="Meta Title"
                value={post.metaTitle}
                onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                placeholder="SEO title"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={post.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="SEO description"
                />
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Keywords
            </h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                placeholder="Add keyword"
                className="flex-1 input-field"
              />
              <Button
                onClick={handleAddKeyword}
                size="sm"
                icon="Plus"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {post.keywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="primary"
                  className="cursor-pointer"
                  onClick={() => handleRemoveKeyword(keyword)}
                >
                  {keyword}
                  <ApperIcon name="X" size={12} className="ml-1" />
                </Badge>
              ))}
</div>
          </div>
        </div>
      </div>

      {/* Media Browser Modal */}
      {showMediaBrowser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Select Media
              </h3>
              <button
                onClick={() => setShowMediaBrowser(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <MediaBrowser
                onSelect={(media) => {
                  handleInputChange('featuredImage', media.url)
                  setShowMediaBrowser(false)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Simple media browser component for the modal
const MediaBrowser = ({ onSelect }) => {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading media
    const loadMedia = async () => {
      try {
        // This would use the actual media service
        const mockMedia = [
          { Id: 1, name: 'hero-image.jpg', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop', type: 'image' },
          { Id: 2, name: 'blog-cover.jpg', url: 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=800&h=600&fit=crop', type: 'image' },
          { Id: 3, name: 'tech-background.jpg', url: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&h=600&fit=crop', type: 'image' }
        ]
        await new Promise(resolve => setTimeout(resolve, 500))
        setMedia(mockMedia)
      } catch (err) {
        console.error('Failed to load media')
      } finally {
        setLoading(false)
      }
    }
    loadMedia()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {media.map((item) => (
        <div
          key={item.Id}
          onClick={() => onSelect(item)}
          className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
        >
          <img
            src={item.url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  )
}

export default PostEditor