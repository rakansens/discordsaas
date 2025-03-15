/**
 * NextAuth.js middleware for authentication
 * Created: 2025/3/14
 * Updated: 2025/3/14 - Simplified middleware to avoid conflicts with NextAuth
 * 
 * This middleware is intentionally minimal to avoid conflicts with NextAuth.js.
 * Authentication is handled by the useAuth hook in client components.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This is an empty middleware that doesn't do anything
// Authentication is handled by the useAuth hook in client components
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// We're not using middleware for authentication anymore
export const config = {
  matcher: [],
};
