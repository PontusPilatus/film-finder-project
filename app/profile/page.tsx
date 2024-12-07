'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import { FiUser, FiMail, FiCalendar, FiClock, FiLock, FiLogOut } from 'react-icons/fi'

interface UserProfile {
  user_id: number;
  email: string | null;
  created_at: string;
  is_legacy: boolean;
  last_login: string | null;
}

export default function Profile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showPasswordChange, setShowPasswordChange] = useState(false)

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
          .eq('email', user.email)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
        } else {
          setProfile(userProfile)
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

  async function handleSignOut() {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  async function handlePasswordChange() {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      alert('Password updated successfully!');
      setNewPassword('');
      setShowPasswordChange(false);
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-blue-400 border-t-transparent"></div>
          <p className="text-gray-400 animate-pulse">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-background-dark/5 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-background-dark/10 to-transparent animate-pulse-slow"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

        <div className="relative container-wrapper">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="hero-text inline-block">
                Your Profile
              </span>
            </h1>
            <p className="text-xl text-gray-300/90 mb-8 max-w-xl mx-auto">
              Manage your account settings
            </p>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="container-wrapper -mt-8 relative z-10 mb-16">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 shadow-[0_8px_32px_rgba(0,0,0,0.24)]">
            <div className="space-y-8">
              {profile ? (
                <>
                  {/* User ID */}
                  <div className="glass-card group p-4 hover:bg-white/[0.03] transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                                    flex items-center justify-center group-hover:scale-110 transition-all duration-300 hover-glow">
                        <FiUser className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">User ID</label>
                        <p className="text-gray-100 font-medium">{profile.user_id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Password Change Section */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <FiLock className="w-4 h-4" />
                      Password
                    </label>
                    {showPasswordChange ? (
                      <div className="flex gap-4">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="input-field flex-grow"
                          placeholder="Enter new password"
                          minLength={6}
                        />
                        <button
                          onClick={handlePasswordChange}
                          className="btn-primary group whitespace-nowrap"
                        >
                          Update
                          <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowPasswordChange(false);
                            setNewPassword('');
                          }}
                          className="btn-secondary whitespace-nowrap"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowPasswordChange(true)}
                        className="glass-card group px-4 py-2 hover:bg-white/[0.03] transition-all duration-300 
                                 inline-flex items-center gap-2 hover:scale-105"
                      >
                        <FiLock className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                        <span className="text-gray-300 group-hover:text-white transition-colors">Change Password</span>
                      </button>
                    )}
                  </div>

                  {/* Email */}
                  <div className="glass-card group p-4 hover:bg-white/[0.03] transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                                    flex items-center justify-center group-hover:scale-110 transition-all duration-300 hover-glow">
                        <FiMail className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Email</label>
                        <p className="text-gray-100 font-medium">{profile.email || 'Not set'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card group p-4 hover:bg-white/[0.03] transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                                      flex items-center justify-center group-hover:scale-110 transition-all duration-300 hover-glow">
                          <FiCalendar className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Account Created</label>
                          <p className="text-gray-100 font-medium">
                            {new Date(profile.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card group p-4 hover:bg-white/[0.03] transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                                      flex items-center justify-center group-hover:scale-110 transition-all duration-300 hover-glow">
                          <FiClock className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Last Login</label>
                          <p className="text-gray-100 font-medium">
                            {profile.last_login
                              ? new Date(profile.last_login).toLocaleString()
                              : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSignOut}
                      className="glass-card group px-4 py-2 hover:bg-red-500/10 transition-all duration-300 
                               inline-flex items-center gap-2 hover:scale-105 text-red-400 hover:text-red-300"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="text-6xl">👤</div>
                  <p className="text-xl text-gray-400">No profile data found</p>
                  <p className="text-gray-500">Try signing in again</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 