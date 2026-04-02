import NextAuth from "next-auth";
import LinkedIn from "next-auth/providers/linkedin";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    LinkedIn,
    Facebook,
    Google,
  ],
  callbacks: {
    async jwt({ token, account }) {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any).provider = token.provider;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any).providers = token.providers;
      return session;
    },
  },
});
