# Project Requirements Document

## 1. Project Overview

This project is a Discord Bot Control Center built to empower users with a single, intuitive interface that manages their Discord bots. By leveraging Supabase as the primary backend with PostgreSQL for structured data, the system facilitates secure storage, real-time data updates, and robust authentication through both Discord and Google OAuth using NextAuth.js. The application not only allows users to create and control their bots but also provides command configuration, file uploads for bot avatars, and integration with powerful third-party APIs like OpenAI and DeepL.

The platform is being built to offer a comprehensive and modern solution for bot management while ensuring security through strategies like AES-256-GCM token encryption and Supabase’s Row Level Security (RLS). Key objectives include providing a seamless authentication flow, easy bot and command management, and real-time status updates, all wrapped in a UI inspired by Discord’s dark theme with flexible, responsive design elements. Success will be measured by user satisfaction, stable real-time interactions, and scalable performance on Vercel.

## 2. In-Scope vs. Out-of-Scope

**In-Scope:**

*   Frontend implementation using Next.js, React, and TypeScript with Tailwind CSS, shadcn/ui, and Framer Motion for a modern, interactive UI.
*   Backend services powered by Next.js API Routes integrated with Supabase for database, storage, and real-time capabilities.
*   A dual authentication system using Discord OAuth and Google OAuth integrated via NextAuth.js.
*   Core bot management features including bot creation, process control (start/stop), real-time status monitoring, and encrypted token management using AES-256-GCM.
*   Command management system: create, update, delete commands with options and prompt configuration.
*   File uploads and storage management for bot avatars and other files, including automated image resizing and optimization.
*   Integration of additional third-party APIs (OpenAI, Perplexity, YouTube, DeepL, Stability AI, Anthropic, Spotify, Twitch) along with system analytics (Vercel Analytics, Sentry).
*   Administrative interface for system administrators covering broader user and system management features.

**Out-of-Scope:**

*   Native mobile apps or desktop applications; the focus is on a web-based control center.
*   Full-scale localization beyond Japanese (with English support planned as a future expansion).
*   Extensive advanced analytics or complex payment integrations in the initial release.
*   A separate external service for bot process management; all functionality will be integrated within the application.
*   Support for file types beyond the approved images, audio, and documents as defined.

## 3. User Flow

A new or returning user will first encounter a modern login screen offering the option to authenticate via Discord or Google OAuth. Users can also choose a standard email/password login if necessary. Once the credentials are verified and a secure JWT token is issued (with session management backed by NextAuth.js and Supabase Auth), the user is redirected to a personalized dashboard where the UI adapts based on their role (standard user or system administrator). This role-based access management ensures that each user only sees the functionalities they are permitted to use.

After landing on the dashboard, users navigate to the bot management section where they can create new bots or update existing ones by entering details like bot name, encrypted token, and client ID. From this section, users can also manage commands—setting names, descriptions, options, and prompt details. Real-time notifications and subtle animations inform users about status changes or errors, keeping them updated without needing to refresh. For administrators, an additional management panel is available to oversee user accounts, monitor API usage, and adjust system configurations.

## 4. Core Features

*   **Authentication System:**

    *   Integration of Discord OAuth and Google OAuth using NextAuth.js
    *   Email/password login option
    *   Session management with JWT tokens and secure storage using Supabase Auth

*   **Bot Management:**

    *   Create, edit, and delete bot entries with details like bot name, token (encrypted via AES-256-GCM), client ID, and settings
    *   In-app bot process control (start/stop) via Discord.js and Vercel Serverless Functions
    *   Real-time status monitoring with Supabase Realtime

*   **Command & Prompt Configuration:**

    *   Creation and management of commands tied to specific bots
    *   Detailed prompt management including command options, text prompts, and variables

*   **File Upload & Storage:**

    *   Upload bot avatars and additional files using Supabase Storage
    *   Enforce file type restrictions (PNG, JPEG, GIF, WebP for images; MP3, WAV for audio; PDF, TXT for documents)
    *   Automatic image processing: resizing to 128x128px, optimization, and thumbnail generation

*   **Third-Party API Integrations:**

    *   Integration with OpenAI, Perplexity, YouTube, DeepL, Stability AI, Anthropic, Spotify, and Twitch APIs
    *   Encrypted storage for API credentials
    *   Monitoring of API usage with Supabase and custom logging

*   **Administrative & Monitoring Features:**

    *   Separate administrator dashboard for user management (account verification, suspension)
    *   System-wide usage monitoring, configuration management, and error reporting (Sentry, Vercel Analytics)
    *   Detailed logs for bots and commands

## 5. Tech Stack & Tools

*   **Frontend:**

    *   Framework: Next.js with React
    *   Language: TypeScript
    *   UI Framework: Tailwind CSS, shadcn/ui, Framer Motion
    *   IDE Integration: Cursor and Windsurf for advanced IDE features and AI-powered suggestions

*   **Backend:**

    *   API Routes using Next.js API Routes
    *   Database & Realtime: Supabase with PostgreSQL and Supabase Realtime
    *   Storage: Supabase Storage for file management
    *   Authentication: NextAuth.js configured with Discord OAuth and Google OAuth
    *   Bot Process Management: Discord.js and Vercel Serverless Functions

*   **Third-Party Integrations:**

    *   OpenAI API, Perplexity API, YouTube API, DeepL API, Stability AI API, Anthropic API, Spotify API, Twitch API
    *   Monitoring Tools: Vercel Analytics, Sentry

*   **Deployment:**

    *   Vercel for hosting and deployment
    *   Environment variables management for secure key storage

## 6. Non-Functional Requirements

*   **Performance:**

    *   Quick page load times with optimized bundling and caching
    *   Real-time updates delivered promptly through Supabase Realtime; target response times under 200ms for live notifications

*   **Security:**

    *   AES-256-GCM symmetric encryption for sensitive data (tokens, API credentials)
    *   Secure key management via environment variables and Vercel configuration
    *   Supabase Row Level Security ensuring users only access their own data
    *   Regular vulnerability checks and strict rate limiting for API endpoints

*   **Usability & Accessibility:**

    *   Modern, responsive, and accessible UI with dark/light mode toggling
    *   Clear navigation and visual feedback using subtle animations and notifications
    *   Preparation for multilingual support using next-i18next, starting with Japanese and future English support

*   **Scalability & Compliance:**

    *   Scalable architecture via serverless functions on Vercel and Supabase-managed database
    *   Compliance with data protection standards through encrypted data storage and controlled access

## 7. Constraints & Assumptions

*   The project depends on continuous availability and performance of Supabase services (database, storage, and realtime features) and Vercel for deployment.
*   Authentication is fully managed via NextAuth.js with native integrations for Discord and Google OAuth; any changes in OAuth provider policies could require updates.
*   The bot process management leverages Discord.js along with Vercel Serverless Functions, assuming these components work within provided resource constraints.
*   It is assumed that initial language support will be Japanese with plans to extend to English and other languages in future iterations using next-i18next.
*   The encryption keys and sensitive environment variables are securely managed and accessible only via secure server-side operations.

## 8. Known Issues & Potential Pitfalls

*   **API Rate Limits:**

    *   Third-party APIs (Discord, OpenAI, etc.) may impose rate limits. Mitigation includes caching strategies, local fallbacks, and careful API call management.

*   **Real-Time Data Handling:**

    *   Ensuring real-time updates via Supabase Realtime can be challenging if there are network or scalability issues. Employ retry mechanisms and optimize subscriptions.

*   **Encryption & Security:**

    *   The reliance on AES-256-GCM and environment-managed keys requires strict adherence to security best practices. Regular security audits and vulnerability scans will help prevent breaches.

*   **Process Management:**

    *   Managing bot processes through Vercel Serverless Functions can be complex when scaling or handling unexpected failures. Implement robust error handling, logging, and notification systems to address failures promptly.

*   **File Uploads and Image Processing:**

    *   File size and type validations must be strictly enforced. Automated image processing (resizing and optimization) could introduce delays if not optimized. Monitor performance and adjust processing pipelines as needed.

This document serves as the primary reference for building the Discord Bot Control Center with Supabase and OAuth integrations. Every detail—from the authentication flow to third-party API integration—has been laid out to ensure that subsequent technical documents (Tech Stack, Frontend Guidelines, Backend Structure, etc.) can be generated without any ambiguity or missing information.
