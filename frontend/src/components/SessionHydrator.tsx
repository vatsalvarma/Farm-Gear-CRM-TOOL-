'use client'

/**
 * SessionHydrator
 * ───────────────
 * Runs once when the app loads. If a user is logged in (has accessToken in
 * localStorage), it silently calls GET /users/me to fetch the latest user
 * data from the database (photo, phone, kycCompleted, etc.) and merges it
 * into authStore.
 *
 * This means users NEVER need to log out and back in just because we added
 * new fields to the user object.
 */

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { userApi } from '@/lib/api/user'

export function SessionHydrator() {
  const { isAuthenticated, updateUser } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) return

    // Silently refresh user data from the DB
    userApi.getMe()
      .then((profile) => {
        updateUser({
          fullName:          profile.fullName,
          phone:             profile.phone           || undefined,
          profilePhotoUrl:   profile.profilePhotoUrl || undefined,
          preferredLanguage: profile.preferredLanguage,
          kycCompleted:      profile.kycCompleted ?? false,
        })
      })
      .catch(() => {
        // Network error or 401 — the API client's response interceptor handles
        // token refresh / forced logout automatically. Safe to swallow here.
      })
  }, [isAuthenticated]) // re-runs if auth state changes (e.g. after login)

  return null // renders nothing
}
