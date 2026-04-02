import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import Facebook from "next-auth/providers/facebook";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      authorization: {
        params: { scope: "openid profile email" },
      },
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Store which provider was used
      if (account) {
        token.provider = account.provider;
        if (!token.providers) token.providers = [];
        if (Array.isArray(token.providers) && !token.providers.includes(account.provider)) {
          token.providers.push(account.provider);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      // Pass provider info to client
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any).provider = token.provider;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any).providers = token.providers;
      return session;
    },
  },
});
