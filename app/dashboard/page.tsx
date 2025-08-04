'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useRouter } from 'next/navigation'

interface Link {
  id: string
  url: string
  tags: string
  created_at: string
  group_title?: string // Dodano za AI grupiranje
}

const groupColors = ['#6366f1', '#f59e42', '#10b981', '#f43f5e', '#eab308', '#3b82f6'];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [url, setUrl] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [grouping, setGrouping] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      setUser(user)
      await fetchLinks(user.id)
      setLoading(false)
    }
    getUser()
  }, [router])

  const fetchLinks = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setLinks(data || [])
    } catch (error) {
      console.error('Error fetching links:', error)
    }
  }

  const saveLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim() || !user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('links')
        .insert({
          user_id: user.id,
          url: url.trim(),
          tags: tags.trim()
        })

      if (error) throw error

      // Refresh links
      await fetchLinks(user.id)
      setUrl('')
      setTags('')
    } catch (error) {
      console.error('Error saving link:', error)
      alert('Error saving link')
    } finally {
      setSaving(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTags = (tagsString: string) => {
    if (!tagsString.trim()) return []
    return tagsString.split(/[,\s]+/).filter(tag => tag.length > 0)
  }

  // Funkcija za AI grupiranje linkov
  const groupLinks = async (links: Link[]) => {
    const res = await fetch('/api/cluster-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ links }),
    });
    const data = await res.json();
    // setGroups(data.groups || []);
  };

  // AI grupiranje in shranjevanje group_title v bazo
  const groupLinksAndSave = async (links: Link[]) => {
    setGrouping(true);
    const res = await fetch('/api/cluster-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ links }),
    });
    const data = await res.json();
    if (data.grouped) {
      for (const { url, group_title } of data.grouped) {
        await supabase
          .from('links')
          .update({ group_title })
          .eq('url', url);
      }
      // Počakaj, da se vsi updejti zaključijo, nato ponovno naloži linke
      await fetchLinks(user.id);
    }
    setGrouping(false);
  };

  // Po nalaganju linkov pokliči AI grupiranje, če še ni group_title
  useEffect(() => {
    if (links.length > 0 && links.some(l => !l.group_title) && !grouping) {
      groupLinksAndSave(links);
    }
  }, [links]);

  // Razdeli linke po group_title
  const grouped = links.reduce((acc, link) => {
    if (!link.group_title) return acc;
    if (!acc[link.group_title]) acc[link.group_title] = [];
    acc[link.group_title].push(link);
    return acc;
  }, {} as Record<string, Link[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">LinkNest</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.email}</p>
          </div>
          <div className="flex gap-4">
            {user?.email === 'markobtc@gmail.com' && (
              <button
                onClick={() => router.push('/admin')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Admin
              </button>
            )}
            <button
              onClick={signOut}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Add New Link Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Save a New Link</h2>
          <form onSubmit={saveLink} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags (optional)
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="work, javascript, tutorial"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas or spaces</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Link'}
            </button>
          </form>
        </div>

        {/* AI grupirani linki po group_title */}
        {Object.keys(grouped).length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4">AI skupine</h2>
            {Object.entries(grouped).map(([groupTitle, groupLinks], idx) => (
              <div
                key={groupTitle}
                className="mb-8 p-4 rounded-xl border-4"
                style={{ borderColor: groupColors[idx % groupColors.length] }}
              >
                <h3 className="text-lg font-bold mb-4">{groupTitle}</h3>
                <ul>
                  {groupLinks.map(link => (
                    <li key={link.id} className="mb-2">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline font-medium">{link.url}</a>
                      {link.tags && (
                        <span className="ml-2 text-xs text-gray-500">({link.tags})</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Saved Links */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Saved Links ({links.length})
          </h2>
          
          {links.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No links saved yet. Add your first link above!
            </p>
          ) : (
            <div className="space-y-4">
              {links.map((link) => (
                <div key={link.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col gap-2">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium break-all"
                    >
                      {link.url}
                    </a>
                    
                    {link.tags && (
                      <div className="flex flex-wrap gap-1">
                        {formatTags(link.tags).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      Saved on {formatDate(link.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}