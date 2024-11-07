import Link from 'next/link'

export default function ConfirmEmail() {
  return (
    <div className="max-w-md mx-auto text-center">
      <div className="card space-y-6">
        <h1 className="text-3xl font-bold text-gray-100">Check Your Email</h1>
        <div className="text-gray-300 space-y-4">
          <p>
            We've sent you a confirmation email. Please check your inbox and click the link to verify your account.
          </p>
          <p className="text-sm text-gray-400">
            Don't see the email? Check your spam folder or try logging in to resend the confirmation email.
          </p>
        </div>
        <div className="flex justify-center">
          <Link href="/login" className="btn-primary">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  )
} 