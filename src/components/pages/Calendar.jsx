import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import { getAllPosts, schedulePost, updateScheduledPost } from '@/services/api/postsService'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

const Calendar = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPost, setSelectedPost] = useState(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [schedulingDate, setSchedulingDate] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getAllPosts()
      setPosts(data)
    } catch (err) {
      setError('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  // Convert posts to calendar events
  const events = posts
    .filter(post => post.scheduledPublishAt || post.publishedAt)
    .map(post => ({
      id: post.Id,
      title: post.title,
      start: new Date(post.scheduledPublishAt || post.publishedAt),
      end: new Date(post.scheduledPublishAt || post.publishedAt),
      resource: post
    }))

  const handleSelectSlot = useCallback(({ start }) => {
    if (start < new Date()) {
      toast.error('Cannot schedule posts in the past')
      return
    }
    setSchedulingDate(start)
    setShowScheduleModal(true)
  }, [])

  const handleSelectEvent = useCallback((event) => {
    setSelectedPost(event.resource)
  }, [])

  const handleEventDrop = async ({ event, start }) => {
    if (start < new Date()) {
      toast.error('Cannot schedule posts in the past')
      return
    }

    try {
      await updateScheduledPost(event.id, start.toISOString())
      toast.success('Post rescheduled successfully')
      loadPosts()
    } catch (err) {
      toast.error('Failed to reschedule post')
    }
  }

  const handleSchedulePost = async (postId) => {
    try {
      await schedulePost(postId, schedulingDate.toISOString())
      toast.success('Post scheduled successfully')
      setShowScheduleModal(false)
      setSchedulingDate(null)
      loadPosts()
    } catch (err) {
      toast.error('Failed to schedule post')
    }
  }

  const EventComponent = ({ event }) => {
    const post = event.resource
    return (
      <div className="flex items-center space-x-2 p-1">
        <div className={`w-2 h-2 rounded-full ${
          post.status === 'published' ? 'bg-green-500' : 
          post.status === 'scheduled' ? 'bg-blue-500' : 
          'bg-yellow-500'
        }`} />
        <span className="text-xs font-medium truncate">{event.title}</span>
      </div>
    )
  }

  const eventStyleGetter = (event) => {
    const post = event.resource
    let backgroundColor = '#6b7280' // default gray
    
    if (post.status === 'published') {
      backgroundColor = '#10b981' // green
    } else if (post.status === 'scheduled') {
      backgroundColor = '#3b82f6' // blue
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  if (loading) return <Loading type="calendar" />
  if (error) return <Error message={error} onRetry={loadPosts} />

  const draftPosts = posts.filter(post => post.status === 'draft')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Publication Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Schedule and manage your blog post publications
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/posts/new')}
            icon="Plus"
          >
            New Post
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/admin/posts')}
            icon="FileText"
          >
            All Posts
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Published</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Scheduled</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click on empty dates to schedule posts • Drag events to reschedule
          </p>
        </div>
      </div>

      {/* Calendar */}
      <div className="card p-6">
        <div style={{ height: '600px' }}>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onEventDrop={handleEventDrop}
            selectable
            resizable={false}
            eventPropGetter={eventStyleGetter}
            components={{
              event: EventComponent
            }}
            views={['month', 'week', 'day']}
            defaultView="month"
            popup
            dragFromOutsideItem={() => ({})}
            className="dark:text-gray-100"
          />
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Schedule Post for {schedulingDate?.toLocaleDateString()}
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Select a draft post to schedule for publication:
              </p>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {draftPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <ApperIcon name="FileText" size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No draft posts available</p>
                    <Button
                      onClick={() => navigate('/admin/posts/new')}
                      className="mt-4"
                      size="sm"
                    >
                      Create New Post
                    </Button>
                  </div>
                ) : (
                  draftPosts.map(post => (
                    <div
                      key={post.Id}
                      onClick={() => handleSchedulePost(post.Id)}
                      className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {post.title || 'Untitled Post'}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Last updated: {new Date(post.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Post Details Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Post Details
              </h3>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {selectedPost.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={
                      selectedPost.status === 'published' ? 'success' : 
                      selectedPost.status === 'scheduled' ? 'info' : 
                      'warning'
                    }>
                      {selectedPost.status}
                    </Badge>
                    {selectedPost.scheduledPublishAt && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Scheduled for {new Date(selectedPost.scheduledPublishAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                
                {selectedPost.excerpt && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedPost.excerpt}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>Created: {new Date(selectedPost.createdAt).toLocaleDateString()}</p>
                    <p>Views: {selectedPost.views.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/posts/edit/${selectedPost.Id}`)}
                      icon="Edit"
                    >
                      Edit
                    </Button>
                    {selectedPost.status === 'published' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/blog/${selectedPost.slug}`)}
                        icon="ExternalLink"
                      >
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Calendar