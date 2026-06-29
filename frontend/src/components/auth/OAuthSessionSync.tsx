'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'

/**
 * Invisible component that lives inside login/register pages.
 * When NextAuth resolves an authenticated session (after OAuth redirect),
 * it syncs the backend tokens + user into the Zustand store and redirects
 * to the correct dashboard.
 */
export function OAuthSessionSync() {
  const { data: session, status } = useSession()
  const { setAuth, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated' && session?.farmGearUser && session.accessToken && !isAuthenticated) {
      const { farmGearUser, accessToken, refreshToken } = session

      setAuth(
        {
          id: farmGearUser.id,
          fullName: farmGearUser.fullName,
          email: farmGearUser.email,
          role: farmGearUser.role as any,
          profilePhotoUrl: farmGearUser.profilePhotoUrl,
          emailVerified: farmGearUser.emailVerified,
          preferredLanguage: 'en',
        },
        accessToken,
        refreshToken ?? ''
      )

      // Redirect based on role
      if (farmGearUser.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else if (farmGearUser.role === 'OWNER') {
        router.push('/owner/dashboard')
      } else {
        router.push('/farmer/dashboard')
      }
    }
  }, [status, session, isAuthenticated, setAuth, router])

  return null
}
