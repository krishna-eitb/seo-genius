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
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          grant_type: "refresh_token",
          refresh_token: token.refreshToken,
        }),
      }
    );

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt:
        Math.floor(Date.now() / 1000) +
        refreshedTokens.expires_in,
      refreshToken:
        refreshedTokens.refresh_token ??
        token.refreshToken,
    };
  } catch (error) {
    console.error("RefreshAccessTokenError:", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/webmasters.readonly",
          ].join(" "),
        },
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },

  callbacks: {
    async jwt({ token, account }) {
      // First login
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
        };
      }

      // Access token still valid
      if (
        token.expiresAt &&
        Date.now() < Number(token.expiresAt) * 1000
      ) {
        return token;
      }

      // Refresh expired token
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        error: token.error,
        user: {
          ...session.user,
          id: token.sub,
        },
      };
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };