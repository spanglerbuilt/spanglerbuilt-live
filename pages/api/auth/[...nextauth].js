import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

var OWNER_EMAIL = 'michael@spanglerbuilt.com'

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error:  '/login',
  },
  callbacks: {
    async signIn({ user }) {
      // Allow owner always
      if (user.email === OWNER_EMAIL) return true
      // Allow any client with a valid email
      if (user.email) return true
      return false
    },
    async session({ session }) {
      // Add role to session so pages know who is logged in
      if (session.user) {
        session.user.role = session.user.email === OWNER_EMAIL
          ? 'contractor'
          : 'client'
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl
    },
  },
})
