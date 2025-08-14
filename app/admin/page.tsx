'use client'

import { useEffect, useState } from 'react'
import { Grid3X3, List as ListIcon, Loader2, FolderOpen, X } from 'lucide-react'
import { supabase } from '../../utils/supabase/client'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  created_at: string
  role: string // dodano
}

interface AdminStats {
  totalUsers: number
  totalLinks: number
  averageLinksPerUser: number
}

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalLinks: 0,
    averageLinksPerUser: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      // Preveri vlogo iz profiles
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
    
      if (error || !profile || profile.role !== 'admin') {
        router.push('/')
        return
      }
      setUser(user)
      await Promise.all([fetchUsers(), fetchStats()])
      setLoading(false)
    }
    checkAdminAccess()
  }, [router])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchStats = async () => {
    try {
      // Get total users count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      // Get total links count
      const { count: linkCount } = await supabase
        .from('links')
        .select('*', { count: 'exact', head: true })
      const totalUsers = userCount || 0
      const totalLinks = linkCount || 0
      const averageLinksPerUser = totalUsers > 0 ? Number((totalLinks / totalUsers).toFixed(2)) : 0
      setStats({
        totalUsers,
        totalLinks,
        averageLinksPerUser
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
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

  const goToDashboard = () => {
    router.push('/dashboard')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading admin panel...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">LinkNest Admin</h1>
            <p className="text-sm/6 opacity-90">Administrator Dashboard</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={goToDashboard}
              className="px-4 py-2 rounded-lg transition border border-white/30 hover:bg-white hover:text-black inline-flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4"/> Dashboard
            </button>
            <button
              onClick={signOut}
              className="px-4 py-2 rounded-lg transition border border-white/30 hover:bg-white hover:text-black inline-flex items-center gap-2"
            >
              <X className="w-4 h-4"/> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-xl shadow-sm border border-black/20 p-6">
            <h3 className="text-lg font-semibold mb-2">Total Users</h3>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </div>
          
          <div className="rounded-xl shadow-sm border border-black/20 p-6">
            <h3 className="text-lg font-semibold mb-2">Total Links</h3>
            <p className="text-3xl font-bold">{stats.totalLinks}</p>
          </div>
          
          <div className="rounded-xl shadow-sm border border-black/20 p-6">
            <h3 className="text-lg font-semibold mb-2">Avg Links/User</h3>
            <p className="text-3xl font-bold">{stats.averageLinksPerUser}</p>
          </div>
        </div>

        {/* Users List */}
        <div className="rounded-xl shadow-sm border border-black/20 p-6">
          <h2 className="text-xl font-semibold mb-4">
            All Users ({users.length})
          </h2>
          
          {users.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No users found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Registration Date</th>
                    <th className="text-left py-3 px-4 font-semibold">User ID</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userData) => (
                    <tr key={userData.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-medium">{userData.email}</span>
                        {userData.role === 'admin' && (
                          <span className="ml-2 inline-block border border-black/20 text-xs px-2 py-1 rounded-full">Admin</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-black/70">
                        {formatDate(userData.created_at)}
                      </td>
                      <td className="py-3 px-4 text-black/60 font-mono text-sm">
                        {userData.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}