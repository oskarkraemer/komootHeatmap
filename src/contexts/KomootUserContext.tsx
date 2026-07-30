"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { KomootUserDetails, LoginResult } from "../komoot_api/types";
import { login } from "../komoot_api/client";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

interface KomootUserContextType {
  user: KomootUserDetails | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

const USER_COOKIE = "komoot-user";

const KomootUserContext = createContext<KomootUserContextType | undefined>(
  undefined,
);

function setCookie(name: string, value: string, days = 30) {
  const expires = new Date(
    Date.now() + days * 24 * 60 * 60 * 1000,
  ).toUTCString();

  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));

  return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/`;
}

async function clearIndexedDB() {
  if (!("indexedDB" in window)) return;

  if (!indexedDB.databases) {
    console.warn("indexedDB.databases() not supported.");
    return;
  }

  const databases = await indexedDB.databases();

  await Promise.all(
    databases.map(
      (db) =>
        new Promise<void>((resolve) => {
          if (!db.name) return resolve();

          const request = indexedDB.deleteDatabase(db.name);

          request.onsuccess = () => resolve();
          request.onerror = () => resolve();
          request.onblocked = () => resolve();
        }),
    ),
  );
}

export function KomootUserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<KomootUserDetails | null>(null);

  useEffect(() => {
    const cookie = getCookie(USER_COOKIE);
    if (cookie) {
      try {
        const storedUser = JSON.parse(cookie) as KomootUserDetails;

        posthog.identify(storedUser.userId, {
          email: storedUser.email,
          name: storedUser.displayName,
        });
        setUser(storedUser);
      } catch {
        setUser(null);
      }
    }
  }, []);

  const loginCallback = useCallback(
    async (email: string, password: string) => {
      const result = await login(email, password);
      if (result.success && result.userDetails) {
        const { userDetails } = result;

        posthog.identify(userDetails.userId, {
          email: userDetails.email,
          name: userDetails.displayName,
        });
        posthog.capture("komoot_login_succeeded");
        setUser(userDetails);
        setCookie(USER_COOKIE, JSON.stringify(userDetails));
        router.push("/heatmap");
      } else {
        posthog.capture("komoot_login_failed");
      }
      return result;
    },
    [router],
  );

  const logout = useCallback(async () => {
    posthog.capture("komoot_logout");
    posthog.reset();
    setUser(null);
    deleteCookie(USER_COOKIE);
    await clearIndexedDB();
    router.push("/login");
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: !!user,
      login: loginCallback,
      logout,
    }),
    [user, loginCallback, logout],
  );

  return (
    <KomootUserContext.Provider value={value}>
      {children}
    </KomootUserContext.Provider>
  );
}

export function useKomootUser() {
  const context = useContext(KomootUserContext);

  if (!context) {
    throw new Error("useKomootUser must be used within a KomootUserProvider");
  }

  return context;
}
