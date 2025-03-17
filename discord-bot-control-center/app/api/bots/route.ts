/**
 * API route for bot management
 * Created: 2025/3/13
 * Updated: 2025/3/16 - Supabase連携実装
 */

import { NextRequest, NextResponse } from "next/server";
import { encrypt, decrypt } from "@/lib/encryption";
import { Bot, BotStatus, BotWithoutToken, CreateBotRequest, UpdateBotRequest } from "@/types/bot";
import { mockBots } from "./mockData";
import { use_mcp_tool } from "@/lib/mcp-helpers";

// Supabase Bot型の定義
interface SupabaseBot {
  id: number;
  user_id: string | null;
  name: string;
  client_id: string;
  encrypted_token: string;
  avatar_url: string | null;
  status: string;
  settings: Record<string, any>;
  last_active: string | null;
  created_at: string;
  updated_at: string;
}

// Supabaseからボットを取得する関数
async function fetchBotsFromSupabase(): Promise<SupabaseBot[] | null> {
  try {
    const result = await use_mcp_tool<{rows: SupabaseBot[]}>({
      server_name: 'discord-bot-supabase-mcp',
      tool_name: 'execute_sql_query',
      arguments: {
        query: 'SELECT * FROM public.bots ORDER BY created_at DESC;'
      }
    });
    
    return result.rows || [];
  } catch (error) {
    console.error('Error fetching bots from Supabase:', error);
    return null;
  }
}

/**
 * GET handler for retrieving bots
 */
export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  
  try {
    // Supabaseからボットを取得
    const supabaseBots = await fetchBotsFromSupabase();
    
    // Supabaseからの取得に失敗した場合はモックデータを使用
    const bots = supabaseBots || mockBots;
    
    // If ID is provided, return a specific bot
    if (id) {
      const bot = bots.find(bot => bot.id.toString() === id);
      
      if (!bot) {
        return NextResponse.json(
          { error: "Bot not found" },
          { status: 404 }
        );
      }
      
      // Don't return the encrypted token in the response
      if ('encrypted_token' in bot) {
        const { encrypted_token, ...botWithoutToken } = bot as SupabaseBot;
        return NextResponse.json(botWithoutToken);
      } else {
        const { encryptedToken, ...botWithoutToken } = bot as Bot;
        return NextResponse.json(botWithoutToken);
      }
    }
    
    // Otherwise, return all bots (without tokens)
    const botsWithoutTokens = bots.map(bot => {
      if ('encrypted_token' in bot) {
        const { encrypted_token, ...botWithoutToken } = bot as SupabaseBot;
        return botWithoutToken;
      } else {
        const { encryptedToken, ...botWithoutToken } = bot as Bot;
        return botWithoutToken;
      }
    });
    
    return NextResponse.json(botsWithoutTokens);
  } catch (error) {
    console.error("Error retrieving bots:", error);
    return NextResponse.json(
      { error: "Failed to retrieve bots" },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new bot
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.clientId || !body.token) {
      return NextResponse.json(
        { error: "Missing required fields: name, clientId, token" },
        { status: 400 }
      );
    }
    
    // In a real implementation, this would check authentication
    // and set the userId from the authenticated user
    const userId = "1"; // Mock user ID
    
    try {
      // Supabaseにボットを追加
      const result = await use_mcp_tool({
        server_name: 'discord-bot-supabase-mcp',
        tool_name: 'execute_sql_query',
        arguments: {
          query: `
            BEGIN;
            INSERT INTO public.bots (name, client_id, encrypted_token, user_id, avatar_url, status, settings)
            VALUES ('${body.name}', '${body.clientId}', '${body.token}', ${userId ? `'${userId}'` : 'NULL'}, ${body.avatarUrl ? `'${body.avatarUrl}'` : 'NULL'}, 'offline', '${JSON.stringify(body.settings || {
              prefix: "!",
              autoRestart: true,
              logLevel: "info",
            })}')
            RETURNING *;
            COMMIT;
          `
        }
      });
      
      if (result && result.rows && result.rows.length > 0) {
        // Don't return the encrypted token in the response
        const { encrypted_token, ...botWithoutToken } = result.rows[0];
        return NextResponse.json(botWithoutToken, { status: 201 });
      }
    } catch (supabaseError) {
      console.error("Error creating bot in Supabase:", supabaseError);
      // Supabaseへの追加に失敗した場合はモックデータに追加
    }
    
    // Create a new bot in mock data as fallback
    const newBot: Bot = {
      id: (mockBots.length + 1).toString(),
      userId,
      name: body.name,
      clientId: body.clientId,
      encryptedToken: encrypt(body.token),
      avatarUrl: body.avatarUrl || null,
      status: "offline" as BotStatus,
      settings: body.settings || {
        prefix: "!",
        autoRestart: true,
        logLevel: "info",
      },
      servers: [],
      lastActive: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add to mock data
    mockBots.push(newBot);
    
    // Don't return the encrypted token in the response
    const { encryptedToken, ...botWithoutToken } = newBot;
    
    return NextResponse.json(botWithoutToken, { status: 201 });
  } catch (error) {
    console.error("Error creating bot:", error);
    return NextResponse.json(
      { error: "Failed to create bot" },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for updating a bot
 */
export async function PUT(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }
    
    try {
      // Supabaseでボットを更新
      const updateFields = [];
      
      if (body.name) updateFields.push(`name = '${body.name}'`);
      if (body.clientId) updateFields.push(`client_id = '${body.clientId}'`);
      if (body.token) updateFields.push(`encrypted_token = '${body.token}'`);
      if (body.avatarUrl !== undefined) {
        updateFields.push(`avatar_url = ${body.avatarUrl ? `'${body.avatarUrl}'` : 'NULL'}`);
      }
      if (body.status) updateFields.push(`status = '${body.status}'`);
      if (body.settings) {
        updateFields.push(`settings = jsonb_set(settings, '{}', '${JSON.stringify(body.settings)}')`);
      }
      
      if (updateFields.length > 0) {
        const result = await use_mcp_tool({
          server_name: 'discord-bot-supabase-mcp',
          tool_name: 'execute_sql_query',
          arguments: {
            query: `
              BEGIN;
              UPDATE public.bots
              SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
              WHERE id = ${body.id}
              RETURNING *;
              COMMIT;
            `
          }
        });
        
        if (result && result.rows && result.rows.length > 0) {
          // Don't return the encrypted token in the response
          const { encrypted_token, ...botWithoutToken } = result.rows[0];
          return NextResponse.json(botWithoutToken);
        }
      }
    } catch (supabaseError) {
      console.error("Error updating bot in Supabase:", supabaseError);
      // Supabaseでの更新に失敗した場合はモックデータを更新
    }
    
    // Find the bot to update in mock data as fallback
    const botIndex = mockBots.findIndex(bot => bot.id === body.id);
    
    if (botIndex === -1) {
      return NextResponse.json(
        { error: "Bot not found" },
        { status: 404 }
      );
    }
    
    // Update the bot in mock data
    const updatedBot = {
      ...mockBots[botIndex],
      name: body.name || mockBots[botIndex].name,
      clientId: body.clientId || mockBots[botIndex].clientId,
      encryptedToken: body.token ? encrypt(body.token) : mockBots[botIndex].encryptedToken,
      avatarUrl: body.avatarUrl !== undefined ? body.avatarUrl : mockBots[botIndex].avatarUrl,
      status: body.status || mockBots[botIndex].status,
      settings: body.settings ? { ...mockBots[botIndex].settings, ...body.settings } : mockBots[botIndex].settings,
      updatedAt: new Date().toISOString(),
    };
    
    // Update in mock data
    mockBots[botIndex] = updatedBot;
    
    // Don't return the encrypted token in the response
    const { encryptedToken, ...botWithoutToken } = updatedBot;
    
    return NextResponse.json(botWithoutToken);
  } catch (error) {
    console.error("Error updating bot:", error);
    return NextResponse.json(
      { error: "Failed to update bot" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for deleting a bot
 */
export async function DELETE(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  
  if (!id) {
    return NextResponse.json(
      { error: "Missing required parameter: id" },
      { status: 400 }
    );
  }
  
  try {
    // Supabaseでボットを削除
    const result = await use_mcp_tool({
      server_name: 'discord-bot-supabase-mcp',
      tool_name: 'execute_sql_query',
      arguments: {
        query: `
          BEGIN;
          DELETE FROM public.bots WHERE id = ${id};
          COMMIT;
        `
      }
    });
    
    // 成功した場合は成功レスポンスを返す
    if (result) {
      return NextResponse.json({ success: true });
    }
  } catch (supabaseError) {
    console.error("Error deleting bot from Supabase:", supabaseError);
    // Supabaseでの削除に失敗した場合はモックデータから削除
  }
  
  // Find the bot to delete from mock data as fallback
  const botIndex = mockBots.findIndex(bot => bot.id === id);
  
  if (botIndex === -1) {
    return NextResponse.json(
      { error: "Bot not found" },
      { status: 404 }
    );
  }
  
  // Remove from mock data
  mockBots.splice(botIndex, 1);
  
  return NextResponse.json({ success: true });
}
