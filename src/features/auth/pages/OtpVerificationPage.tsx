import { useEffect, useState } from 'react'
import { Alert } from 'antd'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthPageHeader } from '@/features/auth/components/AuthPageHeader'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { LoadingButton } from '@/features/auth/components/LoadingButton'
import { OTPInput } from '@/features/auth/components/OTPInput'
import { OTP_EXPIRY_SECONDS } from '@/features/auth/utils/passwordRules'
import { useResendOtpMutation, useVerifyOtpMutation } from '@/features/auth/services/authApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAppSelector } from '@/store/hooks'

export default function OtpVerificationPage() {
  useDocumentTitle('Verify Identity')
  const navigate = useNavigate()
  const email = useAppSelector((state) => state.auth.flow.otpVerification.email)
  const otpSentAt = useAppSelector((state) => state.auth.flow.otpVerification.otpSentAt)
  const { error, errorType } = useAppSelector((state) => state.auth.flow.otpVerification)
  const [otp, setOtp] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRY_SECONDS)
  const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation()
  const [resendOtp, { isLoading: resending }] = useResendOtpMutation()

  useEffect(() => {
    if (!email) {
      navigate('/auth/forgot-password')
    }
  }, [email, navigate])

  useEffect(() => {
    if (!otpSentAt) return
    const tick = () => {
      const elapsed = Math.floor((Date.now() - otpSentAt) / 1000)
      setSecondsLeft(Math.max(0, OTP_EXPIRY_SECONDS - elapsed))
    }
    tick()
    const interval = window.setInterval(tick, 1000)
    return () => window.clearInterval(interval)
  }, [otpSentAt])

  const handleVerify = async () => {
    if (otp.length !== 6) return
    if (secondsLeft === 0) return
    try {
      await verifyOtp({ email: email!, otp }).unwrap()
      navigate('/auth/reset-password')
    } catch {
      // handled in slice
    }
  }

  const handleResend = async () => {
    if (!email) return
    try {
      await resendOtp({ email }).unwrap()
      setOtp('')
      setSecondsLeft(OTP_EXPIRY_SECONDS)
    } catch {
      // handled in slice
    }
  }

  return (
    <AuthCard glow>
      <AuthPageHeader />
      <Link to="/auth/forgot-password" className="mb-6 inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F97316]">
        <ArrowLeft className="h-4 w-4" /> Change Email
      </Link>

      <h2 className="text-2xl font-bold text-white">Verify Your Identity</h2>
      <p className="mt-2 text-sm text-[#94A3B8]">
        Enter the 6-digit verification code sent to <span className="text-white">{email}</span>.
      </p>

      {error && (
        <Alert
          type={errorType === 'expired' ? 'warning' : 'error'}
          message={error}
          showIcon
          className="!mt-4 !rounded-xl"
        />
      )}

      <div className="mt-8 space-y-6">
        <OTPInput value={otp} onChange={setOtp} disabled={verifying || resending} error={Boolean(error)} />

        <div className="flex items-center justify-between text-sm">
          <span className="text-[#94A3B8]">
            {secondsLeft > 0 ? (
              <>Code expires in <span className="font-semibold text-[#F97316]">{secondsLeft}s</span></>
            ) : (
              <span className="text-[#F59E0B]">Verification code expired</span>
            )}
          </span>
          <button
            type="button"
            disabled={secondsLeft > 0 || resending}
            onClick={handleResend}
            className="font-medium text-[#F97316] disabled:cursor-not-allowed disabled:opacity-40 hover:text-orange-400"
          >
            Resend OTP
          </button>
        </div>

        <LoadingButton
          label="Verify Code"
          loading={verifying}
          disabled={otp.length !== 6 || secondsLeft === 0}
          onClick={handleVerify}
        />
      </div>

      <p className="mt-4 text-center text-xs text-[#64748B]">Demo code: 123456</p>
    </AuthCard>
  )
}
