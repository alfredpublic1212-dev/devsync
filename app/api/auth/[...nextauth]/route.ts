import NextAuth from "next-auth";

const handler = NextAuth({
  providers: [], // disables google + github completely
  session: { strategy: "jwt" },
});

export { handler as GET, handler as POST };
