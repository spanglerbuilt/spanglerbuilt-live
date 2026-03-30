import { getSession } from 'next-auth/react'

export default function Home() { return null }

export async function getServerSideProps(context) {
  var session = await getSession(context)
  if (session) {
    var dest = session.user.email === 'michael@spanglerbuilt.com'
      ? '/dashboard'
      : '/client/dashboard'
    return { redirect: { destination: dest, permanent: false } }
  }
  return { redirect: { destination: '/login', permanent: false } }
}
