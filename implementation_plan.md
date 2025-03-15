# Implementation plan

Below is the step-by-step implementation plan for the Discord BOT Control Center. Each step references specific sections from the provided documentation.

---

## Phase 1: Environment Setup

1. **Initialize Git Repository**
   - Create a new Git repository for the project with branches `main` and `dev`.
   - Reference: Project Overview: Key Features, Important Considerations.

2. **Set Up Node Environment**
   - Confirm Node.js v20.2.1 is installed. If not, install Node.js v20.2.1.
   - Reference: Tech Stack: Core Tools.

3. **Create Next.js Application**
   - Run `npx create-next-app@14 discord-bot-control-center --typescript` to set up a Next.js 14 project (Note: Next.js 14 is required for compatibility with current AI coding tools and LLM models).
   - Reference: Tech Stack: Frontend.

4. **Install Dependencies**
   - Navigate to the project directory and install required dependencies:
     - React (bundled with Next.js)
     - Tailwind CSS
     - shadcn/ui
     - Framer Motion
     - NextAuth.js
   - Command example:
     ```bash
     cd discord-bot-control-center
     npm install tailwindcss shadcn-ui framer-motion next-auth
     ```
   - Reference: Tech Stack: Frontend, Authentication.

5. **Configure Tailwind CSS**
   - Follow Tailwind CSS installation docs to create/configure `tailwind.config.js` and include it in your CSS (e.g., `/styles/globals.css`).
   - Reference: UI/UX: Discord-inspired dark theme.

6. **Initialize Supabase Project and Environment Variables**
   - Create a new Supabase project and set up the database tables as listed:
     - `users`, `bots`, `commands`, `prompts`, `api_connections`, `logs`
   - In the Next.js project, create an `.env.local` file with Supabase credentials (e.g., `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
   - Reference: Database Design (Supabase), Project Overview: Key Features.

7. **Set Up NextAuth.js**
   - Create the authentication API route at `/pages/api/auth/[...nextauth].ts` and configure NextAuth.js with Discord OAuth and Google OAuth using the SupabaseAdapter.
   - Make sure to include encryption settings (AES-256-GCM) for token/credential encryption; keys should be stored securely using Vercel’s environment variable encryption.
   - Reference: Authentication, Important Considerations: Security.

8. **Validation**
   - Run `node -v` to verify Node version and `npm run dev` to start the Next.js development server and ensure the starter project runs.
   - Reference: Tech Stack: Core Tools.

---

## Phase 2: Frontend Development

9. **Set Up Global Layout and Navigation**
   - Create a layout component at `/components/Layout.tsx` that includes a header with navigation links (Dashboard, Bots, Commands, Admin).
   - Ensure design uses Discord-inspired dark theme and the accent color (#5865F2), with fonts Inter (headings) and Noto Sans (body).
   - Reference: UI/UX: Discord-inspired dark theme & Fonts.

10. **Create Home/Dashboard Page**
    - Create `/pages/dashboard.tsx` as the main dashboard page to display a summary of bot statuses and activity.
    - Use shadcn/ui components for consistent styling.
    - Reference: Project Overview: Key Features.

11. **Implement Bot Management Page**
    - Create `/pages/bots.tsx` with functionalities to create, edit, delete, and start/stop bots.
    - Include form components with client-side validation.
    - Reference: Features: Bot Management.

12. **Implement Command Management Page**
    - Create `/pages/commands.tsx` for managing bot commands and prompts.
    - Use form controls to handle command creation and editing.
    - Reference: Features: Command Management.

13. **Set Up Authentication UI**
    - Create a login page at `/pages/auth/login.tsx` that integrates NextAuth’s sign-in flow for Discord and Google users.
    - Include links/buttons for both providers.
    - Reference: Authentication: Discord OAuth, Google OAuth.

14. **Implement Dark/Light Mode Toggle**
    - Add a toggle component in the global layout allowing users to switch themes.
    - Use Tailwind CSS classes and store the preference (e.g., in local storage).
    - Reference: UI/UX: Dark/light mode toggle.

15. **Integrate Framer Motion for UI Animations**
    - Enhance key UI components (e.g., page transitions, modal pop-ups) using Framer Motion in the relevant components.
    - Ensure animations are smooth and performance optimized.
    - Reference: Tech Stack: Framer Motion.

16. **Validation**
    - Run `npm run dev` and manually test navigation, form validations, theme toggling, and animations.
    - Reference: App Flow: UI Navigation Testing.

---

## Phase 3: Backend Development

17. **Implement Next.js API Routes for Bot Management**
    - Create an API route at `/pages/api/bots/index.ts` to handle GET (list bots) and POST (create a new bot) requests.
    - Use Supabase client libraries to interact with the `bots` table.
    - Reference: Features: Bot Management, Database Design (Supabase).

18. **Implement API Route for Command Management**
    - Create `/pages/api/commands/index.ts` for handling command-related GET, POST, PUT, DELETE actions interacting with the `commands` table.
    - Reference: Features: Command Management, Database Design (Supabase).

19. **Integrate Encryption in API Routes**
    - In sensitive endpoints (e.g., storing tokens), implement AES-256-GCM encryption logic using a secure Node.js crypto library.
    - Ensure encryption keys are accessed from environment variables.
    - Reference: Authentication: Symmetric Encryption, Important Considerations: Security.

20. **Implement Real-time Updates with Supabase Realtime**
    - Configure API endpoints or backend logic to subscribe to changes in bot statuses using Supabase Realtime features.
    - Reference: Features: Real-time Updates.

21. **Configure File Upload Handling**
    - Create an API route at `/pages/api/upload.ts` for handling file uploads, ensuring file size limits are enforced (5MB for images, 20MB for audio).
    - Integrate image processing features (e.g., resizing avatars to 128x128px) using a Node.js image processing library.
    - Reference: Features: Storage, File uploads.

22. **Validation**
    - Use tools like Postman or curl to test each API endpoint (e.g., `/api/bots`, `/api/commands`, `/api/upload`) ensuring proper responses and RLS enforcement with Supabase.
    - Reference: Q&A: Endpoint Testing.

---

## Phase 4: Integration

23. **Connect Frontend to Bot Management API**
    - In `/services/api.ts` (or similar utility file), implement fetch/axios calls to the `/api/bots` endpoint to retrieve and manipulate bot data.
    - Reference: App Flow: Bot Management Integration.

24. **Connect Frontend to Command Management API**
    - Implement API calls from `/pages/commands.tsx` to the `/api/commands` endpoint.
    - Reference: App Flow: Command Management Integration.

25. **Integrate Authentication with Frontend**
    - Use NextAuth.js client helpers in the login page and protected pages to handle sign in and session retrieval.
    - Reference: Authentication: NextAuth.js.

26. **Integrate Real-time Updates on Dashboard**
    - In `/pages/dashboard.tsx`, subscribe to Supabase Realtime channels to listen for bot status updates and reflect them in the UI.
    - Reference: Features: Real-time Updates.

27. **Validation**
    - Manually test the complete flow: sign in via Discord/Google, create/edit bots, see real-time status updates, and verify file upload processes.
    - Reference: App Flow: End-to-End Testing.

---

## Phase 5: Deployment

28. **Configure Vercel Deployment Settings**
    - Push the repository to GitHub and connect the repo to Vercel.
    - Set environment variables in Vercel (e.g., `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, encryption keys, OAuth credentials).
    - Reference: Deployment: Vercel, Authentication: Environment Variable Security.

29. **Deploy the Application on Vercel**
    - Deploy the Next.js application using Vercel’s deployment process.
    - Reference: Deployment: Vercel.

30. **Post-Deployment Testing**
    - Run end-to-end tests (using Cypress or manual walkthroughs) on the production URL to verify all functionalities including SSR, API routes, authentication, and real-time updates.
    - Reference: Q&A: Pre-Launch Checklist.

31. **Finalize Documentation and Monitor Logs**
    - Update README with deployment instructions and monitor logs via Vercel and Supabase dashboards.
    - Reference: Important Considerations: Scalability, Security.

---

This plan outlines a clear path from setting up your development environment, building both frontend and backend components, integrating them, and finally deploying to Vercel. Each step is aligned with the project’s technical requirements and key features.