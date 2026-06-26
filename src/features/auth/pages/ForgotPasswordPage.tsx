import { Alert, Form, Input } from 'antd'
import { ArrowLeft, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthPageHeader } from '@/features/auth/components/AuthPageHeader'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { LoadingButton } from '@/features/auth/components/LoadingButton'
import { useForgotPasswordMutation } from '@/features/auth/services/authApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setForgotPasswordEmail } from '@/store/slices/authSlice'

interface ForgotPasswordForm {
  email: string
}

export default function ForgotPasswordPage() {
  useDocumentTitle('Reset Password')
  const [form] = Form.useForm<ForgotPasswordForm>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { error, successMessage, status } = useAppSelector((state) => state.auth.flow.forgotPassword)
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const onFinish = async (values: ForgotPasswordForm) => {
    dispatch(setForgotPasswordEmail(values.email))
    try {
      await forgotPassword(values).unwrap()
      navigate('/auth/verify-otp')
    } catch {
      // handled in slice
    }
  }

  return (
    <AuthCard glow>
      <AuthPageHeader />
      <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F97316]">
        <ArrowLeft className="h-4 w-4" /> Back to Login
      </Link>

      <h2 className="text-2xl font-bold text-white">Reset Your Password</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
        Enter your administrator email address and we will send a 6-digit verification code.
      </p>

      {error && <Alert type="error" message={error} showIcon className="mt-4! rounded-xl!" />}
      {successMessage && status === 'success' && (
        <Alert type="success" message={successMessage} showIcon className="mt-4! rounded-xl!" />
      )}

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        className="login-form mt-6"
        onFinish={onFinish}
      >
        <Form.Item
          label={<span className="text-sm text-[#CBD5E1]">Email Address</span>}
          name="email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Enter a valid email address' },
          ]}
        >
          <Input prefix={<Mail className="h-4 w-4 text-[#64748B]" />} placeholder="admin@alygo.com" className="rounded-xl! border-[#1F2937]! bg-[#030712]/80!" />
        </Form.Item>

        <LoadingButton htmlType="submit" label="Send Verification Code" loading={isLoading} />
      </Form>

      <p className="mt-4 text-center text-xs text-[#64748B]">Demo OTP code: 123456</p>
    </AuthCard>
  )
}
