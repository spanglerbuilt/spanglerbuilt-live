import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

var OWNER = 'michael@spanglerbuilt.com'

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      if (user.email) return true
      return false
    },
    async session({ session }) {
      if (session.user) {
        session.user.role = session.user.email === OWNER ? 'contractor' : 'client'
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl
    },
  },
})
