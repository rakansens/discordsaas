/**
 * Mock data for bot management API
 * Created: 2025/3/13
 */

import { Bot } from "@/types/bot";
import { encrypt } from "@/lib/encryption";

// Mock data for development
// In a real implementation, this would be stored in Supabase
export let mockBots: Bot[] = [
  {
    id: "1",
    userId: "1",
    name: "Moderation Bot",
    clientId: "123456789012345678",
    encryptedToken: encrypt("mock-token-for-moderation-bot"),
    avatarUrl: "/placeholder-bot-1.svg",
    status: "online",
    settings: {
      prefix: "!",
      autoRestart: true,
      logLevel: "info",
    },
    lastActive: "2025-03-13T01:23:45Z",
    createdAt: "2025-01-15T12:00:00Z",
    updatedAt: "2025-03-12T18:30:00Z",
  },
  {
    id: "2",
    userId: "1",
    name: "Music Bot",
    clientId: "234567890123456789",
    encryptedToken: encrypt("mock-token-for-music-bot"),
    avatarUrl: "/placeholder-bot-2.svg",
    status: "online",
    settings: {
      prefix: ".",
      autoRestart: true,
      logLevel: "info",
    },
    lastActive: "2025-03-13T02:34:56Z",
    createdAt: "2025-02-01T09:15:00Z",
    updatedAt: "2025-03-10T14:20:00Z",
  },
  {
    id: "3",
    userId: "1",
    name: "Utility Bot",
    clientId: "345678901234567890",
    encryptedToken: encrypt("mock-token-for-utility-bot"),
    avatarUrl: "/placeholder-bot-3.svg",
    status: "offline",
    settings: {
      prefix: "/",
      autoRestart: false,
      logLevel: "warn",
    },
    lastActive: "2025-03-12T12:45:12Z",
    createdAt: "2025-02-15T16:30:00Z",
    updatedAt: "2025-03-05T11:10:00Z",
  },
  {
    id: "4",
    userId: "1",
    name: "AI Assistant Bot",
    clientId: "456789012345678901",
    encryptedToken: encrypt("mock-token-for-ai-assistant-bot"),
    avatarUrl: "/placeholder-bot-4.svg",
    status: "error",
    settings: {
      prefix: "?",
      autoRestart: true,
      logLevel: "debug",
    },
    lastActive: "2025-03-12T18:12:33Z",
    createdAt: "2025-03-01T10:00:00Z",
    updatedAt: "2025-03-11T09:45:00Z",
  },
];
