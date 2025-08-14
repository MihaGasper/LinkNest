'use client'

import { useEffect, useState } from 'react'
import { Plus, Bookmark, Loader2, FolderOpen, X, Shield, Zap, BarChart3, Cloud, Check, Star, ArrowRight, Users, Building } from 'lucide-react'
import { supabase } from '../utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [loading, setLoading] = useState(false)
  // Only monthly subscription or lifetime one-time
  const [currency, setCurrency] = useState<'usd' | 'eur'>('usd')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already signed in
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        router.push('/dashboard')
      }
    }
    getUser()
  }, [router])

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in:', error)
      alert('Error signing in with Google')
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (user) {
    return (
      <div className="min-h-screen bg-white text-black">
        <header className="bg-black text-white">
          <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">LinkNest</h1>
            <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
                className="px-4 py-2 rounded-lg transition border border-white/30 hover:bg-white hover:text-black inline-flex items-center gap-2"
            >
                <FolderOpen className="w-4 h-4"/> Go to dashboard
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
        <main className="max-w-6xl mx-auto px-4 py-14">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
            <p className="text-black/70">You are signed in as {user.email}. Continue organizing your links.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Bookmark className="h-7 w-7" />
              <span className="text-2xl font-bold tracking-tight">LinkNest</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/dashboard')} className="px-4 py-2 rounded-lg border border-black/20 hover:bg-black/5 transition">
                Dashboard
              </button>
              <button
                onClick={signInWithGoogle}
                disabled={loading}
                className="px-4 py-2 rounded-lg border border-black hover:bg-black hover:text-white transition disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading ? (<><Loader2 className="w-4 h-4 animate-spin"/> Signing in…</>) : (<><Plus className="w-4 h-4"/> Get Started</>)}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Organize Your Links, <span className="underline underline-offset-4">Unlock Your Potential</span>
            </h1>
            <p className="text-xl text-black/70 mb-8 leading-relaxed">
              Streamline your research with LinkNest—save, organize, and retrieve links with speed and clarity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={signInWithGoogle}
          disabled={loading}
                className="px-8 py-3 rounded-lg border border-black bg-black text-white hover:opacity-90 transition inline-flex items-center gap-2"
              >
                {loading ? (<><Loader2 className="w-5 h-5 animate-spin"/> Signing in…</>) : (<>Start Free Trial <ArrowRight className="ml-1 h-5 w-5"/></>)}
              </button>
              <button
                className="px-8 py-3 rounded-lg border border-black/30 bg-transparent hover:bg-black/5 transition inline-flex items-center gap-2"
                onClick={() => router.push('/dashboard')}
              >
                Watch Demo
              </button>
            </div>
            <p className="text-sm text-black/60 mt-4">No credit card required • 50 free links</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Everything you need to manage links</h2>
            <p className="text-xl text-black/70 max-w-2xl mx-auto">Built for professionals, researchers, and teams who need reliable link management.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="rounded-xl border border-black/20 hover:shadow-md transition-all p-6">
              <div className="w-12 h-12 bg-black/5 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Seamless Google Authentication</h3>
              <p className="text-black/70">One-click Google sign-in. Instant secure access to your bookmarks.</p>
            </div>
            {/* Card 2 */}
            <div className="rounded-xl border border-black/20 hover:shadow-md transition-all p-6">
              <div className="w-12 h-12 bg-black/5 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Link Saving</h3>
              <p className="text-black/70">Quickly store URLs with optional tags. AI groups your links automatically.</p>
            </div>
            {/* Card 3 */}
            <div className="rounded-xl border border-black/20 hover:shadow-md transition-all p-6">
              <div className="w-12 h-12 bg-black/5 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Comprehensive Admin Dashboard</h3>
              <p className="text-black/70">Track users, monitor engagement, and get insights into usage patterns.</p>
            </div>
            {/* Card 4 */}
            <div className="rounded-xl border border-black/20 hover:shadow-md transition-all p-6">
              <div className="w-12 h-12 bg-black/5 rounded-lg flex items-center justify-center mb-4">
                <Cloud className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Cloud Storage</h3>
              <p className="text-black/70">All data stored securely in Supabase. Access your links anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 border-t border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Choose the plan that fits your needs</h2>
            <p className="text-xl text-black/70 max-w-2xl mx-auto">Scale effortlessly from personal use to team link management.</p>
            {/* Currency Toggle */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrency('usd')}
                  className={`px-3 py-1.5 rounded border ${currency === 'usd' ? 'bg-black text-white border-black' : 'border-black/30 hover:bg-black/5'}`}
                >
                  USD
                </button>
                <button
                  onClick={() => setCurrency('eur')}
                  className={`px-3 py-1.5 rounded border ${currency === 'eur' ? 'bg-black text-white border-black' : 'border-black/30 hover:bg-black/5'}`}
                >
                  EUR
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="rounded-xl border border-black/20 p-6">
              <div className="w-12 h-12 bg-black/5 rounded-lg flex items-center justify-center mb-4"><Bookmark className="h-6 w-6"/></div>
              <h3 className="text-xl font-bold">Solo Saver</h3>
              <div className="mt-3"><span className="text-3xl font-bold">Free</span></div>
              <p className="text-black/70 mt-2">Perfect for getting started</p>
              <ul className="space-y-2 mt-4 text-sm">
                <li className="flex items-center gap-2"><Check className="w-4 h-4"/> Up to 50 saved links</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4"/> 3 tags per link</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4"/> Basic search</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4"/> Google authentication</li>
              </ul>
              <button onClick={signInWithGoogle} className="w-full mt-6 px-4 py-2 rounded-lg border border-black hover:bg-black hover:text-white transition">Get Started Free</button>
            </div>

            {/* Team Catalyst */}
            <div className="rounded-xl border border-black/20 p-6 ring-1 ring-black">
              <div className="w-12 h-12 bg-black/5 rounded-lg flex items-center justify-center mb-4"><Star className="h-6 w-6"/></div>
              <h3 className="text-xl font-bold">Team Catalyst</h3>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-3xl font-bold">{currency === 'usd' ? '$' : '€'}5</span>
                <span className="text-black/70">/month</span>
                <span className="text-black/50">or</span>
                <span className="text-2xl font-semibold">{currency === 'usd' ? '$' : '€'}50</span>
                <span className="text-black/70">lifetime</span>
              </div>
              <p className="text-black/70 mt-2">For power users</p>
              <ul className="space-y-2 mt-4 text-sm">
                <li className="flex items-center gap-2"><Check className="w-4 h-4"/> Unlimited links</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4"/> Unlimited tags</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4"/> Advanced search & filters</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4"/> Export functionality</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4"/> Priority support</li>
              </ul>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                <button
                onClick={async () => {
                  const res = await fetch('/api/create-checkout-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ currency, interval: 'month' }),
                  })
                  const data = await res.json()
                  if (data?.url) window.location.href = data.url
                }}
                className="w-full px-4 py-2 rounded-lg border border-black bg-black text-white hover:opacity-90 transition"
              >
                Start Pro Trial
                </button>
                <button
                  onClick={async () => {
                    const res = await fetch('/api/create-checkout-session', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ currency, mode: 'payment' }),
                    })
                    const data = await res.json()
                    if (data?.url) window.location.href = data.url
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-black hover:bg-black hover:text-white transition"
                >
                  Buy Lifetime
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-black/10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Ready to organize your digital life?</h2>
          <p className="text-xl text-black/70 mb-8">Join professionals who trust LinkNest to manage their links efficiently.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={signInWithGoogle} className="px-8 py-3 rounded-lg border border-black bg-black text-white hover:opacity-90 transition inline-flex items-center gap-2">
              Start Your Free Trial <ArrowRight className="ml-1 h-5 w-5"/>
            </button>
            <button onClick={() => router.push('/dashboard')} className="px-8 py-3 rounded-lg border border-black/30 hover:bg-black/5 transition">
              Schedule Demo
        </button>
          </div>
          <p className="text-sm text-black/60 mt-4">No credit card required • Cancel anytime • 30-day money-back guarantee</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <Bookmark className="h-8 w-8" />
              <span className="text-2xl font-bold">LinkNest</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/70">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/dpa" className="hover:text-white transition-colors">DPA</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/70">
            <p>&copy; 2024 LinkNest. All rights reserved.</p>
          </div>
      </div>
      </footer>
    </div>
  )
}