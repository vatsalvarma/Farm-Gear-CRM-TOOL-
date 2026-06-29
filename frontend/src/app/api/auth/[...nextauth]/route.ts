import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    /**
     * Called after a successful sign-in from a provider.
     * We exchange the provider token for our own backend JWT
     * and stash everything we need onto the token object.
     */
    async jwt({ token, account, profile }) {
      if (account && profile) {
        try {
          const response = await axios.post(`${API_URL}/auth/oauth`, {
            provider: account.provider.toUpperCase(), // "GOOGLE" | "GITHUB"
            providerAccountId: account.providerAccountId,
            email: token.email,
            name: token.name,
            image: token.picture,
            accessToken: account.access_token,
          })

          const { accessToken, refreshToken, user } = response.data
          token.accessToken = accessToken
          token.refreshToken = refreshToken
          token.farmGearUser = user
        } catch (err) {
          console.error('[NextAuth] Backend OAuth exchange failed:', err)
          token.error = 'OAuthBackendError'
        }
      }
      return token
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      session.farmGearUser = token.farmGearUser as any
      session.error = token.error as string | undefined
      return session
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 90 * 24 * 60 * 60, // 90 days
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
