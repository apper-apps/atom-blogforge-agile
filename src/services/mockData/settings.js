export const settings = {
  blogTitle: 'TechBlog',
  tagline: 'Insights, Tutorials & Technology Trends',
  description: 'A modern blog focused on web development, artificial intelligence, sustainability, and the future of technology. Join us as we explore the latest trends and share practical insights for developers and tech enthusiasts.',
  logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80',
  favicon: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32&q=80',
  socialLinks: {
    twitter: 'https://twitter.com/techblog',
    facebook: 'https://facebook.com/techblog',
    linkedin: 'https://linkedin.com/company/techblog',
    github: 'https://github.com/techblog'
  },
  seo: {
    metaTitle: 'TechBlog - Modern Technology Insights & Tutorials',
    metaDescription: 'Discover the latest in web development, AI, sustainability, and technology trends. Expert insights, practical tutorials, and forward-thinking analysis.',
    keywords: 'technology, web development, artificial intelligence, sustainability, programming, tutorials, tech trends',
    googleAnalytics: 'GA-XXXXXXXXX-X',
    facebookPixel: '123456789012345'
  },
  theme: {
    primaryColor: '#2563eb',
    accentColor: '#7c3aed',
    darkMode: false
},
  domains: [
    {
      Id: 1,
      domain: 'myblog.com',
      verified: true,
      sslEnabled: true,
      createdAt: '2024-01-01T00:00:00Z',
      lastVerified: '2024-01-15T12:00:00Z',
      dnsRecords: [
        {
          Id: 1,
          type: 'A',
          name: '@',
          value: '192.168.1.100',
          ttl: 3600,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          Id: 2,
          type: 'CNAME',
          name: 'www',
          value: 'myblog.com',
          ttl: 3600,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          Id: 3,
          type: 'TXT',
          name: '@',
          value: 'v=spf1 include:_spf.google.com ~all',
          ttl: 3600,
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]
    },
    {
      Id: 2,
      domain: 'blog.example.org',
      verified: false,
      sslEnabled: false,
      createdAt: '2024-01-10T00:00:00Z',
      lastVerified: null,
      dnsRecords: [
        {
          Id: 4,
          type: 'A',
          name: '@',
          value: '192.168.1.101',
          ttl: 3600,
          createdAt: '2024-01-10T00:00:00Z'
        }
      ]
    }
  ],
  updatedAt: '2024-01-01T00:00:00Z'
}