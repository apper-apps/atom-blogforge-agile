import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Badge from '@/components/atoms/Badge'
import { getPostById, createPost, updatePost } from '@/services/api/postsService'

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
    authorId: 1
  })
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [keywordInput, setKeywordInput] = useState('')

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
        publishedAt: status === 'published' ? new Date().toISOString() : post.publishedAt
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
                <Input
                  label="Featured Image URL"
                  value={post.featuredImage}
                  onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                  placeholder="https://example.com/image.jpg"
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
              {['draft', 'published', 'archived'].map((status) => (
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
    </div>
  )
}

export default PostEditor