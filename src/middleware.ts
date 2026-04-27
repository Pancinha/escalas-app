import NextAuth from "next-auth";

const { auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
    authorized({ auth: session }) {
      return !!session?.user;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
});

export default auth;

export const config = {
  // Exclui: auth, assets do Next, arquivos estáticos com extensão (png, svg, jpg, etc.) e /login
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon\\.ico|login|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|otf|css|js|map)$).*)"],
};
