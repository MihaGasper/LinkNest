'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useRouter } from 'next/navigation'

interface Link {
  id: string
  url: string
  tags: string
  created_at: string
  group_title?: string
  description?: string
}

const groupColors = ['#6366f1', '#f59e42', '#10b981', '#f43f5e', '#eab308', '#3b82f6'];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [url, setUrl] = useState('')
  const [tags, setTags] = useState('')
  const [describing, setDescribing] = useState(false)
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

  // AI opis in shranjevanje v bazo
  const describeLinksAndSave = async (linksToDescribe: Link[]) => {
    setDescribing(true)
    try {
      const withoutDesc = linksToDescribe.filter(l => !l.description)
      await Promise.allSettled(
        withoutDesc.map(async (l) => {
          const res = await fetch('/api/describe-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: l.url }),
          })
          const data = await res.json()
          if (data?.description) {
            await supabase
              .from('links')
              .update({ description: data.description })
              .eq('id', l.id)
          }
        })
      )
      await fetchLinks(user.id)
    } catch (e) {
      // ignore
    } finally {
      setDescribing(false)
    }
  }

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

  // Po nalaganju linkov pokliči AI (opis + grupiranje)
  useEffect(() => {
    if (links.length === 0) return
    if (!describing && links.some(l => !l.description)) {
      describeLinksAndSave(links)
    }
    if (!grouping && links.some(l => !l.group_title)) {
      groupLinksAndSave(links)
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <header className="bg-gradient-to-r from-sky-600 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">LinkNest</h1>
            <p className="text-sm/6 opacity-90">Signed in: {user?.email}</p>
          </div>
          <div className="flex gap-3">
            {user?.email === 'markobtc@gmail.com' && (
              <button
                onClick={() => router.push('/admin')}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition"
              >
                Admin
              </button>
            )}
            <button
              onClick={signOut}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Add New Link Form */}
        <div className="bg-white/80 backdrop-blur rounded-xl shadow-sm border border-slate-200 p-6 mb-10">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Add new link</h2>
          <form onSubmit={saveLink} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-1">
                URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-1">
                Tags (optional)
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="work, javascript, tutorial"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-1">Separate with commas or spaces</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : 'Save link'}
            </button>
          </form>
        </div>

        {/* AI grupirani linki po group_title */}
        {Object.keys(grouped).length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">AI groups</h2>
              <span className="text-sm text-slate-500">Groups: {Object.keys(grouped).length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(grouped).map(([groupTitle, groupLinks], idx) => (
                <div
                  key={groupTitle}
                  className="relative rounded-2xl border shadow-sm bg-white/80 backdrop-blur overflow-visible"
                  style={{ borderColor: groupColors[idx % groupColors.length] }}
                >
                  <div
                    className="h-1.5 w-full"
                    style={{ background: `linear-gradient(90deg, ${groupColors[idx % groupColors.length]}, ${groupColors[(idx+1) % groupColors.length]})` }}
                  />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">{groupTitle}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{(groupLinks as Link[]).length}</span>
                    </div>
                    <ul className="space-y-3">
                      {(groupLinks as Link[]).map(link => {
                        const domain = (() => { try { return new URL(link.url).hostname } catch { return link.url } })()
                        return (
                          <li key={link.id} className="relative group">
                            <div className="flex items-start gap-3">
                              <img
                                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                                alt="favicon"
                                className="w-5 h-5 mt-0.5 rounded"
                              />
                              <div className="min-w-0">
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sky-700 hover:underline font-medium break-all"
                                >
                                  {domain}
                                </a>
                                {link.tags && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {formatTags(link.tags).slice(0, 4).map((tag, index) => (
                                      <span
                                        key={index}
                                        className="inline-block bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Tooltip opis na hover */}
                            <div className="absolute z-50 left-8 top-full mt-2 w-80 p-3 rounded-lg border border-slate-200 bg-white shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transform -translate-y-1 transition">
                              <p className="text-sm text-slate-700">
                                {link.description ? link.description : (describing ? 'Generating description…' : 'No description available.')}
                              </p>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}