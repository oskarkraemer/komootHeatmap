import "server-only";

import { cookies } from "next/headers";
import { KomootUserDetails } from "@/src/komoot_api/types";
import { redirect } from "next/navigation";

const COOKIE_NAME = "komoot-user";

export async function getKomootUser(): Promise<KomootUserDetails | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);

  if (!cookie) {
    return null;
  }

  try {
    return JSON.parse(cookie.value) as KomootUserDetails;
  } catch {
    return null;
  }
}

export async function requireKomootUser(): Promise<KomootUserDetails> {
  const user = await getKomootUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
