import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    refreshToken?: string
    error?: string
    farmGearUser?: {
      id: string
      fullName: string
      email: string
      role: string
      profilePhotoUrl?: string
      emailVerified: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    error?: string
    farmGearUser?: {
      id: string
      fullName: string
      email: string
      role: string
      profilePhotoUrl?: string
      emailVerified: boolean
    }
  }
}
