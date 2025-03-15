/**
 * NextAuth.js API route for authentication
 * Created: 2025/3/13
 */

import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

// Encryption utility for sensitive data
import { encrypt, decrypt } from "@/lib/encryption";

// Define authentication options
export const authOptions: NextAuthOptions = {
  // Configure authentication providers
  providers: [
    // Discord OAuth provider
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      // Request additional scopes as needed
      authorization: {
        params: {
          scope: "identify email guilds",
        },
      },
    }),
    
    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    
    // Email/password credentials provider (for development/testing)
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // In a real implementation, this would validate against the database
        // For now, we'll use a mock user for development
        if (
          credentials?.email === "test@example.com" &&
          credentials?.password === "password"
        ) {
          return {
            id: "1",
            name: "Test User",
            email: "test@example.com",
            image: null,
          };
        }
        return null;
      },
    }),
  ],
  
  // Configure session handling
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Custom pages
  pages: {
    signIn: "/login",
    error: "/login",
  },
  
  // Callbacks for customizing authentication behavior
  callbacks: {
    // Customize JWT token
    async jwt({ token, user, account }) {
      // Add user data to token when signing in
      if (user) {
        token.id = user.id;
        token.provider = account?.provider;
      }
      return token;
    },
    
    // Customize session data
    async session({ session, token }) {
      if (session.user) {
        // Add custom user data to session
        session.user.id = token.id as string;
        session.user.provider = token.provider as string;
      }
      return session;
    },
  },
  
  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
};

// Create NextAuth handler
const handler = NextAuth(authOptions);

// Export handler for GET and POST requests
export { handler as GET, handler as POST };
