import NextAuth from "next-auth";

const handler = NextAuth({
  providers: [], // no providers → disables OAuth
  session: { strategy: "jwt" },
});

export { handler as GET, handler as POST };
