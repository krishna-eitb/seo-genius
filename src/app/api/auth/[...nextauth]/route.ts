// import NextAuth, { AuthOptions } from 'next-auth'
// import GoogleProvider from 'next-auth/providers/google'

// export const authOptions: AuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       authorization: {
//         params: {
//           scope: [
//             'openid',
//             'email',
//             'profile',
//             'https://www.googleapis.com/auth/webmasters.readonly',
//           ].join(' '),
//           access_type: 'offline',
//           prompt: 'consent',
//         },
//       },
//     }),
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
//   session: {
//     strategy: 'jwt',
//     maxAge: 60 * 60 * 24 * 7, // 7 days
//   },
//   callbacks: {
//     async jwt({ token, account }) {
//       if (account) {
//         token.accessToken = account.access_token
//         token.refreshToken = account.refresh_token
//         token.expiresAt = account.expires_at
//       }
//       return token
//     },
//     async session({ session, token }) {
//       session.accessToken = token.accessToken as string
//       session.user.id = token.sub as string
//       return session
//     },
//   },
//   pages: {
//     signIn: '/login',
//     error: '/login',
//   },
// }

// const handler = NextAuth(authOptions)
// export { handler as GET, handler as POST }
import NextAuth, { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/webmasters.readonly',
          ].join(' '),
          access_type: 'offline',
          prompt: 'consent',
          include_granted_scopes: 'true',
          response_type: 'code',
        },
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7,
  },

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        token.scope = account.scope

        console.log('====================')
        console.log('GOOGLE ACCOUNT SCOPES')
        console.log(account.scope)
        console.log('====================')
      }

      return token
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.scope = token.scope as string

      if (session.user) {
        session.user.id = token.sub as string
      }

      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }