import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Chart from 'react-apexcharts'
import ApperIcon from '@/components/ApperIcon'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import { getAnalytics, getPostAnalytics } from '@/services/api/analyticsService'

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [postAnalytics, setPostAnalytics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeRange, setTimeRange] = useState('30')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [analyticsData, postData] = await Promise.all([
        getAnalytics(timeRange),
        getPostAnalytics()
      ])
      
      setAnalytics(analyticsData)
      setPostAnalytics(postData)
    } catch (err) {
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadAnalytics} />

  const chartOptions = {
    chart: {
      type: 'area',
      height: 350,
      zoom: { enabled: false },
      toolbar: { show: false }
    },
    colors: ['#2563eb', '#7c3aed'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    grid: {
      borderColor: '#f3f4f6',
      strokeDashArray: 5
    },
    xaxis: {
      categories: analytics?.dailyViews?.map(d => d.date) || [],
      labels: { style: { colors: '#6b7280' } }
    },
    yaxis: {
      labels: { style: { colors: '#6b7280' } }
    },
    tooltip: {
      theme: 'light',
      y: { formatter: (val) => val.toLocaleString() }
    }
  }

  const chartSeries = [
    {
      name: 'Page Views',
      data: analytics?.dailyViews?.map(d => d.views) || []
    },
    {
      name: 'Unique Visitors',
      data: analytics?.dailyViews?.map(d => d.uniqueVisitors) || []
    }
  ]

  const stats = [
    {
      title: 'Total Views',
      value: analytics?.totalViews?.toLocaleString() || '0',
      change: '+12.5%',
      icon: 'Eye',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Unique Visitors',
      value: analytics?.uniqueVisitors?.toLocaleString() || '0',
      change: '+8.2%',
      icon: 'Users',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Avg. Session Duration',
      value: analytics?.avgSessionDuration || '0s',
      change: '+15.3%',
      icon: 'Clock',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Bounce Rate',
      value: analytics?.bounceRate || '0%',
      change: '-2.1%',
      icon: 'TrendingDown',
      color: 'from-orange-500 to-orange-600'
    }
  ]

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your blog's performance and engagement
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {['7', '30', '90'].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                timeRange === days
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {stat.value}
                </p>
                <p className={`text-sm mt-1 ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} from last period
                </p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                <ApperIcon name={stat.icon} size={24} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Views Chart */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Views Over Time
          </h2>
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={350}
          />
        </div>

        {/* Top Posts */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Top Performing Posts
          </h2>
          <div className="space-y-4">
            {postAnalytics.slice(0, 5).map((post, index) => (
              <div key={post.Id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {post.views.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">views</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Traffic Sources
          </h2>
          <div className="space-y-4">
            {analytics?.trafficSources?.map((source) => (
              <div key={source.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }}></div>
                  <span className="text-gray-900 dark:text-gray-100">{source.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 dark:text-gray-400">{source.percentage}%</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {source.visits.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Devices */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Device Breakdown
          </h2>
          <div className="space-y-4">
            {analytics?.devices?.map((device) => (
              <div key={device.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ApperIcon name={device.icon} size={20} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-gray-100">{device.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 dark:text-gray-400">{device.percentage}%</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {device.visits.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics