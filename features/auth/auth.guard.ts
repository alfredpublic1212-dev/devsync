import { redirect } from "next/navigation";
import { getCurrentUser } from "./auth.service";

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return user;
}
