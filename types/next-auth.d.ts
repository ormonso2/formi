import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      plan: string
    }
  }

  interface User {
    plan: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    plan: string
  }
}
