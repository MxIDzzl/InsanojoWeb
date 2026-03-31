import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

export type SessionUser = {
  id: number;
  role: string | null;
  username: string;
};

export async function requireStaffUser() {
  const token = (await cookies()).get("session")?.value;
  if (!token) {
    return { error: "No autenticado.", status: 401 as const };
  }

  let user: SessionUser;
  try {
    user = verifySessionToken(token) as SessionUser;
  } catch {
    return { error: "Sesión inválida.", status: 401 as const };
  }

  if (user.role !== "owner" && user.role !== "host") {
    return { error: "Sin permiso.", status: 403 as const };
  }

  return { user };
}
