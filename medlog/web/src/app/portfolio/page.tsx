'use client'

import { useEffect, useState } from 'react'
import { 
  User, 
  Mail, 
  Calendar, 
  FileText, 
  Award, 
  BookOpen,
  Share2,
  Link as LinkIcon,
  Loader2,
  Save,
  CheckCircle,
  Globe,
  Lock,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react'

interface Publication {
  id: string
  title: string
  type: string
  journal: string
  date: string
  description: string
}

interface Portfolio {
  id: string
  is_public: boolean
  share_token: string | null
  title: string
  bio: string
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [showAddPublication, setShowAddPublication] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    is_public: false
  })

  const [publicationForm, setPublicationForm] = useState({
    title: '',
    type: 'publication',
    journal: '',
    date: '',
    description: ''
  })

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    setLoading(true)
    try {
      const [portfolioRes, profileRes, statsRes] = await Promise.all([
        fetch('/api/portfolio', { credentials: 'include' }),
        fetch('/api/auth/user', { credentials: 'include' }),
        fetch('/api/cases/stats', { credentials: 'include' })
      ])

      if (portfolioRes.ok) {
        const data = await portfolioRes.json()
        setPortfolio(data.portfolio)
        setPublications(data.publications || [])
        setFormData({
          title: data.portfolio?.title || '',
          bio: data.portfolio?.bio || '',
          is_public: data.portfolio?.is_public || false
        })
      }

      if (profileRes.ok) {
        const data = await profileRes.json()
        setProfile(data.profile)
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePortfolio = async () => {
    setSaving(true)
    setSaved(false)

    try {
      await fetch('/api/portfolio', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      fetchPortfolio()
    } catch (error) {
      console.error('Failed to save portfolio:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddPublication = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/portfolio/publications', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(publicationForm)
      })
      setShowAddPublication(false)
      setPublicationForm({ title: '', type: 'publication', journal: '', date: '', description: '' })
      fetchPortfolio()
    } catch (error) {
      console.error('Failed to add publication:', error)
    }
  }

  const handleDeletePublication = async (id: string) => {
    if (!confirm('Delete this publication?')) return
    try {
      await fetch(`/api/portfolio/publications?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      fetchPortfolio()
    } catch (error) {
      console.error('Failed to delete publication:', error)
    }
  }

  const copyShareLink = () => {
    const link = `${window.location.origin}/portfolio/${portfolio?.share_token}`
    navigator.clipboard.writeText(link)
    alert('Link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-gray-600">Create your professional portfolio</p>
        </div>
        {portfolio?.is_public && portfolio?.share_token && (
          <button
            onClick={copyShareLink}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Share2 className="h-4 w-4" />
            Share Portfolio
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="h-10 w-10 text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{profile?.full_name || 'Your Name'}</h2>
            <p className="text-gray-500 capitalize">{profile?.role?.replace('_', ' ') || 'Resident'}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {profile?.email}
              </span>
              {stats && (
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {stats.total_cases} cases
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Surgical Resident, PGY-3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself, your interests, and career goals..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {formData.is_public ? <Globe className="h-5 w-5 text-green-600" /> : <Lock className="h-5 w-5 text-gray-400" />}
              <div>
                <p className="font-medium text-gray-900">Public Portfolio</p>
                <p className="text-sm text-gray-500">
                  {formData.is_public ? 'Anyone with the link can view' : 'Only you can view'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSavePortfolio}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>

          {saved && (
            <p className="text-green-600 text-sm flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Portfolio saved!
            </p>
          )}
        </div>
      </div>

      {/* Publications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Publications & Achievements</h3>
          <button
            onClick={() => setShowAddPublication(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        {showAddPublication && (
          <form onSubmit={handleAddPublication} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
            <input
              type="text"
              value={publicationForm.title}
              onChange={(e) => setPublicationForm({ ...publicationForm, title: e.target.value })}
              placeholder="Title"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={publicationForm.type}
                onChange={(e) => setPublicationForm({ ...publicationForm, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="publication">Publication</option>
                <option value="presentation">Presentation</option>
                <option value="award">Award</option>
                <option value="research">Research</option>
              </select>
              <input
                type="date"
                value={publicationForm.date}
                onChange={(e) => setPublicationForm({ ...publicationForm, date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <input
              type="text"
              value={publicationForm.journal}
              onChange={(e) => setPublicationForm({ ...publicationForm, journal: e.target.value })}
              placeholder="Journal/Conference"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAddPublication(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {publications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No publications or achievements yet. Add your accomplishments to showcase them on your portfolio.
          </p>
        ) : (
          <div className="space-y-3">
            {publications.map((pub) => (
              <div key={pub.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    {pub.type === 'award' ? (
                      <Award className="h-5 w-5 text-primary-600" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-primary-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{pub.title}</p>
                    <p className="text-sm text-gray-500">{pub.journal}</p>
                    <p className="text-xs text-gray-400">{pub.date}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePublication(pub.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
