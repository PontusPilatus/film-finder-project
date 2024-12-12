import Link from 'next/link'
import { FiMail } from 'react-icons/fi'

export default function ConfirmEmail() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            Check Your Email
          </h1>
          <p className="mt-3 text-lg text-gray-300">
            We've sent you a confirmation link
          </p>
        </div>

        {/* Content */}
        <div className="card backdrop-blur-lg p-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                          flex items-center justify-center">
              <FiMail className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="text-gray-300 space-y-4 text-center">
            <p>
              Please check your inbox and click the link to verify your account.
            </p>
            <p className="text-sm text-gray-400">
              Don't see the email? Check your spam folder or try logging in to resend the confirmation email.
            </p>
          </div>

          <div className="flex justify-center pt-4">
            <Link 
              href="/login" 
              className="btn-primary flex items-center justify-center gap-2 py-3 px-6"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 