import { useEffect, useState } from 'react'
import { Alert, Form, Input } from 'antd'
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthPageHeader } from '@/features/auth/components/AuthPageHeader'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { LoadingButton } from '@/features/auth/components/LoadingButton'
import { PasswordStrengthMeter } from '@/features/auth/components/PasswordStrengthMeter'
import { isPasswordStrong } from '@/features/auth/utils/passwordRules'
import { useResetPasswordMutation } from '@/features/auth/services/authApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAppSelector } from '@/store/hooks'

interface ResetPasswordForm {
  password: string
  confirmPassword: string
}

export default function ResetPasswordPage() {
  useDocumentTitle('Create New Password')
  const [form] = Form.useForm<ResetPasswordForm>()
  const navigate = useNavigate()
  const email = useAppSelector((state) => state.auth.flow.otpVerification.email)
  const resetToken = useAppSelector((state) => state.auth.flow.otpVerification.resetToken)
  const { error, status } = useAppSelector((state) => state.auth.flow.resetPassword)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [resetPassword, { isLoading }] = useResetPasswordMutation()

  useEffect(() => {
    if (!email || !resetToken) {
      navigate('/auth/forgot-password')
    }
  }, [email, resetToken, navigate])

  const onFinish = async (values: ResetPasswordForm) => {
    if (!email || !resetToken) return
    try {
      await resetPassword({
        email,
        resetToken,
        password: values.password,
        confirmPassword: values.confirmPassword,
      }).unwrap()
      navigate('/auth/password-updated')
    } catch {
      // handled in slice
    }
  }

  return (
    <AuthCard glow>
      <AuthPageHeader />
      <Link to="/auth/verify-otp" className="mb-6 inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F97316]">
        <ArrowLeft className="h-4 w-4" /> Back to Verification
      </Link>

      <h2 className="text-2xl font-bold text-white">Create New Password</h2>
      <p className="mt-2 text-sm text-[#94A3B8]">Choose a strong password that meets all security requirements.</p>

      {error && status === 'error' && (
        <Alert type="error" message={error} showIcon className="!mt-4 !rounded-xl" />
      )}

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        className="login-form mt-6"
        onFinish={onFinish}
        onValuesChange={(_, values) => setPassword(values.password ?? '')}
      >
        <Form.Item
          label={<span className="text-sm text-[#CBD5E1]">New Password</span>}
          name="password"
          rules={[
            { required: true, message: 'Password is required' },
            {
              validator: (_, value) =>
                !value || isPasswordStrong(value)
                  ? Promise.resolve()
                  : Promise.reject(new Error('Password does not meet requirements')),
            },
          ]}
        >
          <Input
            type={showPassword ? 'text' : 'password'}
            prefix={<Lock className="h-4 w-4 text-[#64748B]" />}
            suffix={
              <button type="button" onClick={() => setShowPassword((p) => !p)} className="text-[#64748B] hover:text-[#F97316]">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            className="!rounded-xl !border-[#1F2937] !bg-[#030712]/80"
          />
        </Form.Item>

        <PasswordStrengthMeter password={password} />

        <Form.Item
          label={<span className="mt-4 block text-sm text-[#CBD5E1]">Confirm Password</span>}
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve()
                return Promise.reject(new Error('Passwords do not match'))
              },
            }),
          ]}
        >
          <Input
            type={showConfirm ? 'text' : 'password'}
            prefix={<Lock className="h-4 w-4 text-[#64748B]" />}
            suffix={
              <button type="button" onClick={() => setShowConfirm((p) => !p)} className="text-[#64748B] hover:text-[#F97316]">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            className="!rounded-xl !border-[#1F2937] !bg-[#030712]/80"
          />
        </Form.Item>

        <div className="mt-6">
          <LoadingButton htmlType="submit" label="Update Password" loading={isLoading} disabled={!isPasswordStrong(password)} />
        </div>
      </Form>
    </AuthCard>
  )
}
