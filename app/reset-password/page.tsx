'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import { FiLock, FiLoader } from 'react-icons/fi'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      // Password updated successfully
      router.push('/login?message=Password updated successfully')
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            Set New Password
          </h1>
          <p className="mt-3 text-lg text-gray-300">
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <div className="card backdrop-blur-lg">
          <form onSubmit={handlePasswordReset} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400">Must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  Updating password...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 