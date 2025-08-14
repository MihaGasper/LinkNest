"use client"

import type React from "react"

import { useEffect, useState, useMemo, useCallback } from "react"
import {
  SearchIcon,
  Plus,
  Grid3X3,
  ListIcon,
  MoreHorizontal,
  Bookmark,
  Check,
  X,
  TagIcon,
  Trash2,
  FolderOpen,
  Loader2,
  Sparkles,
  Globe,
} from "lucide-react"
import { supabase } from "../../utils/supabase/client"
import { useRouter } from "next/navigation"

interface Link {
  id: string
  url: string
  tags: string
  created_at: string
  group_title?: string
  description?: string
}

const groupColors = ["#000000", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#f3f4f6"]

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [url, setUrl] = useState("")
  const [tags, setTags] = useState("")
  const [plan, setPlan] = useState<"free" | "pro">("free")
  const [describing, setDescribing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [grouping, setGrouping] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<"all" | string>("all")
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "alphabetical" | "most-links">("recent")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set())
  const [bulkSelectMode, setBulkSelectMode] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/")
        return
      }
      setUser(user)
      try {
        const { data: prof } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .maybeSingle()
        const p = (prof?.plan as string) || "free"
        setPlan(p === "pro" ? "pro" : "free")
      } catch {}
      await fetchLinks(user.id)
      setLoading(false)
    }
    getUser()
  }, [router])

  const fetchLinks = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
      
      if (error) throw error
      setLinks(data || [])
    } catch (error) {
      console.error("Error fetching links:", error)
    }
  }

  const saveLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim() || !user) return
    const linkLimit = plan === "free" ? 50 : Infinity
    if (links.length >= linkLimit) {
      alert("You have reached the free limit of 50 links. Please upgrade to Team Catalyst to save more links.")
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.from("links").insert({
          user_id: user.id,
          url: url.trim(),
        tags: tags.trim(),
        })

      if (error) throw error

      // Refresh links
      await fetchLinks(user.id)
      setUrl("")
      setTags("")
    } catch (error) {
      console.error("Error saving link:", error)
      alert("Error saving link")
    } finally {
      setSaving(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTags = (tagsString: string) => {
    if (!tagsString.trim()) return []
    return tagsString.split(/[,\s]+/).filter((tag) => tag.length > 0)
  }

  // AI opis in shranjevanje v bazo
  const describeLinksAndSave = async (linksToDescribe: Link[]) => {
    setDescribing(true)
    try {
      const withoutDesc = linksToDescribe.filter((l) => !l.description)
      await Promise.allSettled(
        withoutDesc.map(async (l) => {
          const res = await fetch("/api/describe-link", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: l.url }),
          })
          const data = await res.json()
          if (data?.description) {
            await supabase.from("links").update({ description: data.description }).eq("id", l.id)
          }
        }),
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
    setGrouping(true)
    const res = await fetch("/api/cluster-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ links }),
    })
    const data = await res.json()
    if (data.grouped) {
      for (const { url, group_title } of data.grouped) {
        await supabase.from("links").update({ group_title }).eq("url", url)
      }
      // Počakaj, da se vsi updejti zaključijo, nato ponovno naloži linke
      await fetchLinks(user.id)
    }
    setGrouping(false)
  }

  // Po nalaganju linkov pokliči AI (opis + grupiranje)
  useEffect(() => {
    if (links.length === 0) return
    if (!describing && links.some((l) => !l.description)) {
      describeLinksAndSave(links)
    }
    if (!grouping && links.some((l) => !l.group_title)) {
      groupLinksAndSave(links)
    }
  }, [links])

  // Razdeli linke po group_title
  const grouped = links.reduce(
    (acc, link) => {
      if (!link.group_title) return acc
      if (!acc[link.group_title]) acc[link.group_title] = []
      acc[link.group_title].push(link)
      return acc
    },
    {} as Record<string, Link[]>,
  )

  // Derived groups as array
  const groupsArray = useMemo(() => {
    return Object.entries(grouped).map(([title, glinks]) => ({
      id: title,
      title,
      links: glinks,
    }))
  }, [grouped])

  // Helper: latest date per group
  const getLatestDate = (glinks: Link[]) => {
    return glinks.reduce((max, l) => {
      const t = new Date(l.created_at).getTime()
      return t > max ? t : max
    }, 0)
  }

  // Filtering, searching, sorting
  const filteredGroups = useMemo(() => {
    let list = groupsArray
    if (selectedGroup !== "all") {
      list = list.filter((g) => g.id === selectedGroup)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list
        .map((g) => ({
          ...g,
          links: g.links.filter((l) => {
            const inUrl = l.url.toLowerCase().includes(q)
            const inDesc = (l.description || "").toLowerCase().includes(q)
            const inTags = (l.tags || "").toLowerCase().includes(q)
            return inUrl || inDesc || inTags
          }),
        }))
        .filter((g) => g.links.length > 0)
    }
    switch (sortBy) {
      case "alphabetical":
        list = [...list].sort((a, b) => a.title.localeCompare(b.title))
        break
      case "most-links":
        list = [...list].sort((a, b) => b.links.length - a.links.length)
        break
      case "oldest":
        list = [...list].sort((a, b) => getLatestDate(a.links) - getLatestDate(b.links))
        break
      case "recent":
      default:
        list = [...list].sort((a, b) => getLatestDate(b.links) - getLatestDate(a.links))
    }
    return list
  }, [groupsArray, selectedGroup, searchQuery, sortBy])

  // Bulk selection helpers
  const toggleLinkSelection = useCallback((linkId: string) => {
    setSelectedLinks((prev) => {
      const next = new Set(prev)
      if (next.has(linkId)) next.delete(linkId)
      else next.add(linkId)
      return next
    })
  }, [])

  const selectAllLinks = useCallback(() => {
    const allIds = filteredGroups.flatMap((g) => g.links.map((l) => l.id))
    setSelectedLinks(new Set(allIds))
  }, [filteredGroups])

  const clearSelection = useCallback(() => {
    setSelectedLinks(new Set())
    setBulkSelectMode(false)
  }, [])

  const toggleBulkSelectMode = useCallback(() => {
    setBulkSelectMode((prev) => !prev)
    if (bulkSelectMode) {
      clearSelection()
    }
  }, [bulkSelectMode, clearSelection])

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value)
    setIsSearching(true)
    const t = setTimeout(() => setIsSearching(false), 250)
    return () => clearTimeout(t)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
          <p className="text-base font-medium text-gray-900">Loading your links...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b-2 border-black sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-lg">
                <Globe className="w-7 h-7 text-white" />
              </div>
          <div>
                <h1 className="text-3xl font-bold text-black tracking-tight">LinkNest</h1>
                <p className="text-base text-gray-600 font-medium">Welcome back, {user?.email?.split("@")[0]} • Plan: {plan === "free" ? "Solo Saver" : "Team Catalyst"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {describing && (
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm font-medium">
                  <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                  AI describing...
                </div>
              )}
              {grouping && (
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm font-medium">
                  <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                  AI grouping...
          </div>
              )}
              {user?.email === "markobtc@gmail.com" && (
              <button
                  onClick={() => router.push("/admin")}
                  className="px-6 py-3 text-gray-700 hover:text-black hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 font-medium"
              >
                Admin
              </button>
            )}
            <button
              onClick={signOut}
                className="px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
                Sign out
            </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-black hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Bookmark className="w-8 h-8 text-black" />
              </div>
              <div>
                <p className="text-3xl font-bold text-black">{links.length}</p>
                <p className="text-base text-gray-600 font-medium">Total Links</p>
              </div>
            </div>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-black hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                <FolderOpen className="w-8 h-8 text-black" />
              </div>
              <div>
                <p className="text-3xl font-bold text-black">{groupsArray.length}</p>
                <p className="text-base text-gray-600 font-medium">AI Groups</p>
              </div>
            </div>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-black hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                <TagIcon className="w-8 h-8 text-black" />
              </div>
              <div>
                <p className="text-3xl font-bold text-black">
                  {links.reduce((acc, link) => acc + formatTags(link.tags).length, 0)}
                </p>
                <p className="text-base text-gray-600 font-medium">Total Tags</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 mb-12 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search your links, descriptions, or tags..."
                className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-black/10 focus:border-black bg-white text-gray-900 placeholder-gray-500 text-base font-medium transition-all duration-200"
              />
              <SearchIcon className="w-6 h-6 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              {isSearching && (
                <Loader2 className="w-6 h-6 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 animate-spin" />
              )}
            </div>
            <div className="flex gap-4 items-center">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="px-5 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-black/10 focus:border-black font-medium text-base"
              >
                <option value="all">All groups</option>
                {groupsArray.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-5 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-black/10 focus:border-black font-medium text-base"
              >
                <option value="recent">Recent</option>
                <option value="oldest">Oldest</option>
                <option value="alphabetical">A–Z</option>
                <option value="most-links">Most links</option>
              </select>
              <div className="flex rounded-xl border-2 border-gray-200 overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-4 transition-all duration-200 ${viewMode === "grid" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-50"}`}
                  title="Grid view"
                >
                  <Grid3X3 className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-4 border-l-2 border-gray-200 transition-all duration-200 ${viewMode === "list" ? "bg-black text-white" : "text-gray-600 hover:bg-gray-50"}`}
                  title="List view"
                >
                  <ListIcon className="w-6 h-6" />
                </button>
              </div>
              <button
                onClick={toggleBulkSelectMode}
                className={`px-6 py-4 rounded-xl border-2 inline-flex items-center gap-3 transition-all duration-200 font-medium ${bulkSelectMode ? "bg-black text-white border-black shadow-lg" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"}`}
                title={bulkSelectMode ? "Cancel selection" : "Select"}
              >
                {bulkSelectMode ? (
                  <>
                    <X className="w-5 h-5" /> Cancel
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" /> Select
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {plan === "free" && links.length >= 50 && (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between gap-4">
              <p className="text-gray-800 font-medium">You reached the free plan limit (50 links). Upgrade to save more.</p>
              <div className="flex gap-3">
                <button
                onClick={async () => {
                  const res = await fetch('/api/create-checkout-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ currency: 'usd', interval: 'month' }),
                  })
                  const data = await res.json()
                  if (data?.url) window.location.href = data.url
                }}
                className="px-5 py-3 bg-black text-white rounded-xl"
              >
                Upgrade now
                </button>
                <button
                  onClick={async () => {
                    const res = await fetch('/api/create-checkout-session', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ currency: 'usd', mode: 'payment' }),
                    })
                    const data = await res.json()
                    if (data?.url) window.location.href = data.url
                  }}
                  className="px-5 py-3 border border-black rounded-xl"
                >
                  Buy lifetime
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border-2 border-gray-200 rounded-2xl p-10 mb-16 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-black">Add New Link</h2>
          </div>
          <form onSubmit={saveLink} className="space-y-8">
            <div>
              <label htmlFor="url" className="block text-base font-semibold text-black mb-3">
                URL
              </label>
              <div className="relative">
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-black/10 focus:border-black bg-white text-gray-900 placeholder-gray-500 text-base font-medium transition-all duration-200 disabled:opacity-50"
                  disabled={plan === "free" && links.length >= 50}
              />
                <Bookmark className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <div>
              <label htmlFor="tags" className="block text-base font-semibold text-black mb-3">
                Tags (optional)
              </label>
              <div className="relative">
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="work, javascript, tutorial"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-black/10 focus:border-black bg-white text-gray-900 placeholder-gray-500 text-base font-medium transition-all duration-200 disabled:opacity-50"
                  disabled={plan === "free" && links.length >= 50}
              />
                <TagIcon className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
              <p className="text-sm text-gray-600 mt-3 font-medium">Separate with commas or spaces</p>
            </div>
            <button
              type="submit"
              disabled={saving || (plan === "free" && links.length >= 50)}
              className="bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-3 font-semibold text-base shadow-lg hover:shadow-xl"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" /> Save Link
                </>
              )}
            </button>
          </form>
        </div>

        {filteredGroups.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-black">AI-Organized Groups</h2>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 border-2 border-gray-200 text-black rounded-xl text-base font-semibold">
                <span>{filteredGroups.length} groups</span>
              </div>
            </div>
            <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8" : "space-y-6"}>
              {filteredGroups.map((group, idx) => (
                <div
                  key={group.id}
                  className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-black hover:shadow-xl transition-all duration-300"
                >
                  <div
                    className="h-2 w-full"
                    style={{
                      backgroundColor: groupColors[idx % groupColors.length],
                    }}
                  ></div>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold text-black">{group.title}</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-sm px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-black font-semibold">
                          {group.links.length} links
                        </span>
                        <button
                          className="p-3 rounded-xl hover:bg-gray-50 border border-gray-200 transition-all duration-200"
                          title="More options"
                        >
                          <MoreHorizontal className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
          </div>
                    <ul className="space-y-5">
                      {group.links.slice(0, 3).map((link) => {
                        const domain = (() => {
                          try {
                            return new URL(link.url).hostname
                          } catch {
                            return link.url
                          }
                        })()
                        return (
                          <li key={link.id} className="relative group/link">
                            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all duration-200">
                              <img
                                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                                alt="favicon"
                                className="w-8 h-8 mt-1 rounded-lg border border-gray-200"
                              />
                              <div className="min-w-0 flex-1">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                                  className="hover:text-black font-semibold break-all text-gray-700 transition-colors text-base"
                                >
                                  {domain}
                                </a>
                                {bulkSelectMode && (
                                  <div className="mt-3">
                                    <label className="inline-flex items-center gap-3 text-base text-gray-700 font-medium">
                                      <input
                                        type="checkbox"
                                        checked={selectedLinks.has(link.id)}
                                        onChange={() => toggleLinkSelection(link.id)}
                                        className="rounded-lg border-2 border-gray-300 text-black focus:ring-black w-5 h-5"
                                      />
                                      Select
                                    </label>
                                  </div>
                                )}
                    {link.tags && (
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {formatTags(link.tags)
                                      .slice(0, 3)
                                      .map((tag, index) => (
                          <span
                            key={index}
                                          className="inline-block bg-gray-100 border border-gray-200 text-gray-700 text-sm px-3 py-1 rounded-lg font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                              </div>
                            </div>
                            <div className="absolute z-50 left-16 top-full mt-3 w-80 p-6 rounded-2xl border-2 border-gray-200 bg-white shadow-2xl opacity-0 pointer-events-none group-hover/link:opacity-100 group-hover/link:translate-y-0 transform -translate-y-2 transition-all duration-300">
                              <p className="text-base text-gray-800 leading-relaxed font-medium">
                                {link.description
                                  ? link.description
                                  : describing
                                    ? "AI is generating description..."
                                    : "No description available."}
                              </p>
                              <div className="mt-4 pt-4 border-t-2 border-gray-100">
                                <p className="text-sm text-gray-600 font-medium">Added {formatDate(link.created_at)}</p>
                              </div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                    <div className="flex items-center justify-between pt-8 mt-8 border-t-2 border-gray-100">
                      <button
                        onClick={() => {
                          const input = document.getElementById("url") as HTMLInputElement | null
                          if (input) input.focus()
                        }}
                        className="text-base px-6 py-3 rounded-xl hover:bg-gray-50 border-2 border-gray-200 text-gray-700 inline-flex items-center gap-3 transition-all duration-200 font-medium hover:border-gray-300"
                      >
                        <Plus className="w-5 h-5" /> Add Link
                      </button>
                      {group.links.length > 3 && (
                        <button className="text-base px-6 py-3 rounded-xl hover:bg-gray-50 border-2 border-gray-200 text-gray-700 inline-flex items-center gap-3 transition-all duration-200 font-medium hover:border-gray-300">
                          <FolderOpen className="w-5 h-5" /> View All ({group.links.length})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </div>
          )}
      </main>

      {selectedLinks.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-2xl px-8 py-6 flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-3 bg-black text-white rounded-xl text-base font-semibold">
              <Check className="w-5 h-5" />
              {selectedLinks.size} selected
            </div>
            <button className="text-base px-6 py-3 rounded-xl hover:bg-gray-50 border-2 border-gray-200 text-gray-700 inline-flex items-center gap-3 transition-all duration-200 font-medium hover:border-gray-300">
              <FolderOpen className="w-5 h-5" /> Move
            </button>
            <button className="text-base px-6 py-3 rounded-xl hover:bg-gray-50 border-2 border-gray-200 text-gray-700 inline-flex items-center gap-3 transition-all duration-200 font-medium hover:border-gray-300">
              <TagIcon className="w-5 h-5" /> Tag
            </button>
            <button className="text-base px-6 py-3 rounded-xl hover:bg-red-50 border-2 border-red-200 text-red-700 inline-flex items-center gap-3 transition-all duration-200 font-medium hover:border-red-300">
              <Trash2 className="w-5 h-5" /> Delete
            </button>
            <button
              onClick={clearSelection}
              className="text-base px-6 py-3 rounded-xl hover:bg-gray-50 border-2 border-gray-200 text-gray-700 inline-flex items-center gap-3 transition-all duration-200 font-medium hover:border-gray-300"
            >
              <X className="w-5 h-5" /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
