# Project Brief

## Project Overview

This project is a Discord Bot Control Center built to provide users with a single, intuitive interface for managing their Discord bots. The system leverages Supabase as the primary backend with PostgreSQL for structured data storage, real-time updates, and secure authentication through both Discord and Google OAuth using NextAuth.js.

## Core Objectives

- Create a comprehensive web-based platform for Discord bot management
- Implement secure authentication using Discord OAuth and Google OAuth
- Provide real-time bot status monitoring and control
- Enable command configuration and management
- Support file uploads for bot avatars and other assets
- Integrate with third-party APIs (OpenAI, DeepL, etc.)
- Ensure data security through encryption and access controls

## Key Features

- **Authentication System:**
  - Discord OAuth and Google OAuth integration via NextAuth.js
  - Email/password login option
  - Secure session management with JWT tokens

- **Bot Management:**
  - Create, edit, and delete bot entries
  - Secure token storage with AES-256-GCM encryption
  - Real-time bot process control (start/stop)
  - Status monitoring with Supabase Realtime

- **Command & Prompt Configuration:**
  - Command creation and management
  - Detailed prompt configuration
  - Command options and variables

- **File Upload & Storage:**
  - Bot avatar uploads using Supabase Storage
  - File type restrictions and validation
  - Automatic image processing and optimization

- **Third-Party API Integrations:**
  - OpenAI, Perplexity, YouTube, DeepL, Stability AI, Anthropic, Spotify, Twitch
  - Secure API credential storage
  - Usage monitoring

- **Administrative Features:**
  - User management for administrators
  - System monitoring and configuration
  - Error reporting and logging

## Target Users

- Discord bot developers and maintainers
- Server administrators who manage multiple bots
- Users who want an easy-to-use interface for bot control
- System administrators (for the admin panel)

## Success Criteria

- Seamless authentication flow
- Stable real-time bot status updates
- Intuitive bot and command management
- Secure data handling and storage
- Responsive and accessible UI
- Scalable performance on Vercel

## Project Constraints

- Web-based application only (no native mobile/desktop apps)
- Initial language support for Japanese with English planned for future
- Reliance on Supabase and Vercel for infrastructure
