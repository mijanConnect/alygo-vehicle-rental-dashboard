import { useNavigate } from 'react-router-dom'
import { AuthPageHeader } from '@/features/auth/components/AuthPageHeader'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { SuccessScreen } from '@/features/auth/components/SuccessScreen'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAppDispatch } from '@/store/hooks'
import { clearAuthFlow } from '@/store/slices/authSlice'

export default function PasswordUpdatedPage() {
  useDocumentTitle('Password Updated')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleBackToLogin = () => {
    dispatch(clearAuthFlow())
    navigate('/login')
  }

  return (
    <AuthCard glow>
      <AuthPageHeader />
      <SuccessScreen
        title="Password Updated Successfully"
        description="Your password has been changed successfully. You can now sign in using your new password."
        buttonLabel="Back To Login"
        onAction={handleBackToLogin}
      />
    </AuthCard>
  )
}
