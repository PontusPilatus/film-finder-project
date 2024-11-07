'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

interface UserProfile {
  user_id: number;
  username: string | null;
  email: string | null;
  created_at: string;
  is_legacy: boolean;
  last_login: string | null;
}

export default function Profile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [username, setUsername] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', parseInt(user.id))
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
        } else {
          setProfile(userProfile)
          setUsername(userProfile.username || '')
        }
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateUsername() {
    try {
      const { error } = await supabase
        .from('users')
        .update({ username })
        .eq('user_id', profile?.user_id)

      if (error) {
        console.error('Error updating username:', error)
      } else {
        alert('Username updated successfully!')
      }
    } catch (error) {
      console.error('Error updating username:', error)
    }
  }

  async function handleSignOut() {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return <div className="text-center text-gray-400">Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow max-w-2xl mx-auto">
        <div className="card space-y-6">
          <h1 className="text-2xl font-bold text-gray-100">Your Profile</h1>

          <div className="space-y-4">
            {profile ? (
              <>
                <div>
                  <label className="text-sm text-gray-400">User ID</label>
                  <p className="text-gray-100">{profile.user_id}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field"
                  />
                  <button
                    onClick={updateUsername}
                    className="btn-primary mt-2"
                  >
                    Update Username
                  </button>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-gray-100">{profile.email || 'Not set'}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Account Created</label>
                  <p className="text-gray-100">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Last Login</label>
                  <p className="text-gray-100">
                    {profile.last_login
                      ? new Date(profile.last_login).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-400">No profile data found</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSignOut}
              className="btn-primary bg-red-600 hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 