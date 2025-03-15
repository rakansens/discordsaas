# .windsurfrules

## Project Overview

*   **Type:** windsurf_file
*   **Description:** Discord BOT コントロールセンター - Supabase & Google認証対応版. This project leverages Supabase as the main backend and integrates Discord as well as Google authentication to offer a robust bot management solution.
*   **Primary Goal:** To develop a secure, feature-rich Discord Bot Control Center using Next.js, Supabase, and modern authentication (Discord and Google OAuth) with real-time updates, encrypted token management, and comprehensive bot/command controls.

## Project Structure

### Framework-Specific Routing

*   **Directory Rules:**

    *   Next.js 14 (App Router): Use app/[route]/page.tsx conventions for building pages and route-based API handlers.
    *   Example 1: "Next.js 14 (App Router)" → `app/auth/login/page.tsx` for the authentication flow.
    *   Example 2: "Next.js (Pages Router)" → `pages/api/auth/[...nextauth].js` pattern (for legacy support, if needed).
    *   Example 3: "React Router 6" → `src/routes/` using createBrowserRouter for client-side routing.

### Core Directories

*   **Versioned Structure:**

    *   app: Contains Next.js 14 API routes, nested layout folders, and page components following the App Router conventions.
    *   components: Houses React components including UI elements, layouts, and feature-specific modules (leveraging shadcn/ui and Framer Motion).

### Key Files

*   **Stack-Versioned Patterns:**

    *   app/layout.tsx: The root layout for Next.js 14, establishing the primary UI structure.
    *   app/page.tsx: The main landing page built with Next.js 14 conventions.
    *   app/api/[...]: API route handlers implemented as route handlers within the app directory.

## Tech Stack Rules

*   **Version Enforcement:**

    *   next@14: App Router is required; avoid using legacy methods such as getInitialProps.
    *   <typescript@4.x>: All project files must enforce strict TypeScript rules for type safety.

## PRD Compliance

*   **Non-Negotiable:**

    *   "CREATE POLICY "Users can only access their own data"": Supabase Row Level Security (RLS) must be implemented to ensure users can only access their own data.

## App Flow Integration

*   **Stack-Aligned Flow:**

    *   Next.js 14 Auth Flow → `app/auth/login/page.tsx` uses server actions for secure authentication.
    *   The dashboard integrates real-time bot status updates via Supabase Realtime subscriptions.
    *   In-app bot management, including creation, launching/stopping, and command configuration, follows Next.js 14 routing and API conventions.
