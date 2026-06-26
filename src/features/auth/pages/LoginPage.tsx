import { Alert, Checkbox, Form, Input } from 'antd'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { AlygoLogo } from '@/features/auth/components/AlygoLogo'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { LoadingButton } from '@/features/auth/components/LoadingButton'
import { useLoginMutation } from '@/features/auth/services/authApi'
import { DEMO_CREDENTIALS, STORAGE_KEYS } from '@/constants'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearLoginError, setCredentials } from '@/store/slices/authSlice'

interface LoginFormValues {
  email: string
  password: string
  remember: boolean
}

export default function LoginPage() {
  useDocumentTitle('Sign In')
  const [form] = Form.useForm<LoginFormValues>()
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const loginError = useAppSelector((state) => state.auth.flow.login.error)
  const [login, { isLoading }] = useLoginMutation()

  const rememberedEmail = localStorage.getItem(STORAGE_KEYS.rememberEmail)

  const onFinish = async (values: LoginFormValues) => {
    dispatch(clearLoginError())
    try {
      const result = await login(values).unwrap()
      dispatch(setCredentials(result))
      if (values.remember) {
        localStorage.setItem(STORAGE_KEYS.rememberEmail, values.email)
      } else {
        localStorage.removeItem(STORAGE_KEYS.rememberEmail)
      }
      const redirect = (location.state as { from?: string })?.from ?? '/'
      navigate(redirect)
    } catch {
      // error synced to redux via extraReducers
    }
  }

  return (
    <AuthCard glow>
      <AlygoLogo className="mb-8" />

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Welcome Back</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">Sign in to your operations dashboard.</p>
      </div>

      {loginError && (
        <Alert
          type="error"
          message={loginError}
          showIcon
          className="mb-5! rounded-lg! border-[#1F2937]! bg-[#030712]/80!"
          closable
          onClose={() => dispatch(clearLoginError())}
        />
      )}

      <Form<LoginFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        className="login-form"
        initialValues={{
          email: rememberedEmail ?? DEMO_CREDENTIALS.email,
          password: DEMO_CREDENTIALS.password,
          remember: Boolean(rememberedEmail),
        }}
        onFinish={onFinish}
      >
        <Form.Item
          label={<span className="text-sm text-[#CBD5E1]">Email</span>}
          name="email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Enter a valid email address' },
          ]}
        >
          <Input
            prefix={<Mail className="h-4 w-4 text-[#64748B]" />}
            placeholder="you@company.com"
            autoComplete="email"
            className="login-input rounded-lg! border-[#1F2937]! bg-[#030712]/80!"
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-sm text-[#CBD5E1]">Password</span>}
          name="password"
          rules={[
            { required: true, message: 'Password is required' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input
            type={showPassword ? 'text' : 'password'}
            prefix={<Lock className="h-4 w-4 text-[#64748B]" />}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-[#64748B] transition-colors hover:text-[#94A3B8]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            placeholder="Enter your password"
            autoComplete="current-password"
            className="login-input rounded-lg! border-[#1F2937]! bg-[#030712]/80!"
          />
        </Form.Item>

        <div className="mb-5 flex items-center justify-between">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox className="text-sm! text-[#94A3B8]!">Remember Me</Checkbox>
          </Form.Item>
          <Link
            to="/auth/forgot-password"
            className="text-sm text-[#94A3B8] transition-colors hover:text-[#F97316]"
          >
            Forgot Password?
          </Link>
        </div>

        <Form.Item shouldUpdate className="mb-0!">
          {() => {
            const email = form.getFieldValue('email')
            const password = form.getFieldValue('password')
            return (
              <LoadingButton
                htmlType="submit"
                label="Sign In"
                loading={isLoading}
                disabled={!email || !password}
              />
            )
          }}
        </Form.Item>
      </Form>

      <p className="mt-8 text-center text-xs text-[#64748B]">© 2026 Alygo. All rights reserved.</p>
    </AuthCard>
  )
}
