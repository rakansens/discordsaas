/**
 * Custom hook for authentication
 * Created: 2025/3/13
 * Updated: 2025/3/14 - Added development mode bypass
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

interface UseAuthReturn {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    provider?: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (provider: string) => Promise<void>;
  logout: () => Promise<void>;
  emailLogin: (email: string, password: string) => Promise<void>;
}

// Check if we're in development mode and auth should be skipped
const isDevelopment = process.env.NODE_ENV === "development";
const shouldSkipAuth = isDevelopment && (process.env.NEXT_PUBLIC_SKIP_AUTH === "true" || process.env.SKIP_AUTH === "true");

/**
 * Custom hook for managing authentication
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<Error | null>(null);

  // In development mode with SKIP_AUTH=true, create a mock user
  const mockUser = shouldSkipAuth
    ? {
        id: "dev-user",
        name: "Development User",
        email: "dev@example.com",
        image: null,
        provider: "development",
      }
    : null;

  // Extract user from session or use mock user in development
  const user = shouldSkipAuth ? mockUser : session?.user || null;
  const isAuthenticated = shouldSkipAuth ? true : !!session;
  const isLoading = shouldSkipAuth ? false : status === "loading";

  /**
   * Login with a provider
   */
  const login = useCallback(
    async (provider: string) => {
      try {
        await signIn(provider, { callbackUrl: "/dashboard" });
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to login with ${provider}`));
        console.error(`Error logging in with ${provider}:`, err);
      }
    },
    [router]
  );

  /**
   * Login with email and password
   */
  const emailLogin = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        if (result?.ok) {
          router.push("/dashboard");
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to login with email"));
        console.error("Error logging in with email:", err);
        throw err;
      }
    },
    [router]
  );

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to logout"));
      console.error("Error logging out:", err);
    }
  }, []);

  // Redirect to login if not authenticated (skip in development with SKIP_AUTH=true)
  useEffect(() => {
    if (!shouldSkipAuth && status === "unauthenticated" && window.location.pathname !== "/login") {
      router.push("/login");
    }
  }, [status, router, shouldSkipAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    emailLogin,
  };
}
