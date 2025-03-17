/**
 * API utility functions
 * Created: 2025/3/13
 * Updated: 2025/3/16 - テンプレート関連の関数を追加
 * 
 * This module provides functions for interacting with the API endpoints.
 */

import { Bot, BotStatus, BotWithoutToken, CreateBotRequest, UpdateBotRequest } from "@/types/bot";
import { Command, CommandPrompt } from "@/types/command";
import { CommandTemplate, TemplateCategory } from "@/types/template";
import { TemplateWithId, CreateTemplateRequest, UpdateTemplateRequest } from "@/hooks/useTemplatesMcp";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/**
 * Generic API request function with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `API request failed with status ${response.status}`
      );
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request error for ${endpoint}:`, error);
    throw error;
  }
}

// Bot API functions

/**
 * Get all bots
 */
export async function getAllBots(): Promise<BotWithoutToken[]> {
  return apiRequest<BotWithoutToken[]>("/api/bots");
}

/**
 * Get a bot by ID
 */
export async function getBotById(id: string): Promise<BotWithoutToken> {
  return apiRequest<BotWithoutToken>(`/api/bots?id=${id}`);
}

/**
 * Create a new bot
 */
export async function createBot(bot: CreateBotRequest): Promise<BotWithoutToken> {
  return apiRequest<BotWithoutToken>("/api/bots", {
    method: "POST",
    body: JSON.stringify(bot),
  });
}

/**
 * Update a bot
 */
export async function updateBot(bot: UpdateBotRequest): Promise<BotWithoutToken> {
  return apiRequest<BotWithoutToken>("/api/bots", {
    method: "PUT",
    body: JSON.stringify(bot),
  });
}

/**
 * Delete a bot
 */
export async function deleteBot(id: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/api/bots?id=${id}`, {
    method: "DELETE",
  });
}

/**
 * Update bot status
 */
export async function updateBotStatus(
  botId: string,
  status: BotStatus
): Promise<BotWithoutToken> {
  return apiRequest<BotWithoutToken>("/api/bots/status", {
    method: "POST",
    body: JSON.stringify({ botId, status }),
  });
}

/**
 * Get bot status
 */
export async function getBotStatus(
  botId: string
): Promise<{ id: string; status: BotStatus; lastActive: string | null }> {
  return apiRequest<{ id: string; status: BotStatus; lastActive: string | null }>(
    `/api/bots/status?botId=${botId}`
  );
}

// Command API functions

/**
 * Get all commands
 */
export async function getAllCommands(): Promise<Command[]> {
  return apiRequest<Command[]>("/api/commands");
}

/**
 * Get commands for a specific bot
 */
export async function getCommandsByBotId(botId: string): Promise<Command[]> {
  return apiRequest<Command[]>(`/api/commands?botId=${botId}`);
}

/**
 * Get a command by ID
 */
export async function getCommandById(id: string): Promise<Command> {
  return apiRequest<Command>(`/api/commands?id=${id}`);
}

/**
 * Create a new command
 */
export async function createCommand(command: any): Promise<Command> {
  return apiRequest<Command>("/api/commands", {
    method: "POST",
    body: JSON.stringify(command),
  });
}

/**
 * Update a command
 */
export async function updateCommand(command: any): Promise<Command> {
  return apiRequest<Command>("/api/commands", {
    method: "PUT",
    body: JSON.stringify(command),
  });
}

/**
 * Delete a command
 */
export async function deleteCommand(id: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/api/commands?id=${id}`, {
    method: "DELETE",
  });
}

// Template API functions

/**
 * Get all templates
 */
export async function getAllTemplates(): Promise<TemplateWithId[]> {
  return apiRequest<TemplateWithId[]>("/api/templates");
}

/**
 * Get templates by category
 */
export async function getTemplatesByCategory(category: TemplateCategory): Promise<TemplateWithId[]> {
  return apiRequest<TemplateWithId[]>(`/api/templates?category=${category}`);
}

/**
 * Get a template by ID
 */
export async function getTemplateById(id: string): Promise<TemplateWithId> {
  return apiRequest<TemplateWithId>(`/api/templates/${id}`);
}

/**
 * Create a new template
 */
export async function createTemplate(template: CreateTemplateRequest): Promise<TemplateWithId> {
  return apiRequest<TemplateWithId>("/api/templates", {
    method: "POST",
    body: JSON.stringify(template),
  });
}

/**
 * Update a template
 */
export async function updateTemplate(template: UpdateTemplateRequest): Promise<TemplateWithId> {
  return apiRequest<TemplateWithId>(`/api/templates/${template.id}`, {
    method: "PUT",
    body: JSON.stringify(template),
  });
}

/**
 * Delete a template
 */
export async function deleteTemplate(id: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/api/templates/${id}`, {
    method: "DELETE",
  });
}
