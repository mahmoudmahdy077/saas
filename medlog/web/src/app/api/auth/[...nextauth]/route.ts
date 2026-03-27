import NextAuth from "next-auth"
import { NextAuthOptions } from "next-auth"
import { SupabaseAdapter } from "next-auth-supabase"
import { getEnv } from "@/lib/env"

const env = getEnv()

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    secret: env.SUPABASE_SERVICE_ROLE_KEY,
  }),
  providers: [
    {
      id: "supabase",
      name: "Supabase",
      type: "oauth",
      wellKnown: `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/.well-known/openid-configuration`,
      authorization: { params: { scope: "openid email profile" } },
      clientId: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      clientSecret: env.SUPABASE_SERVICE_ROLE_KEY,
      idToken: true,
    },
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: env.SUPABASE_SERVICE_ROLE_KEY,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
