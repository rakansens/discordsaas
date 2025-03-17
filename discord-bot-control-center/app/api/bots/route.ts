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
  const useMock = searchParams.get("mock") === "true"; // モックデータを使用するかどうかのフラグ
  
  console.log('GET /api/bots が呼び出されました', { id, useMock });
  
  try {
    // Supabaseからボットを取得
    const supabaseBots = await fetchBotsFromSupabase();
    console.log('Supabaseからのボット取得結果:', supabaseBots ? `${supabaseBots.length}件取得` : '取得失敗');
    
    // 本番環境では常にSupabaseのデータを使用
    // 開発環境でuseMockフラグが指定された場合のみモックデータを使用
    const bots = supabaseBots || (useMock ? mockBots : []);
    
    // If ID is provided, return a specific bot
    if (id) {
      const bot = bots.find(bot => bot.id.toString() === id);
      
      if (!bot) {
        console.log(`ID ${id} のボットが見つかりません`);
        return NextResponse.json(
          { error: "Bot not found" },
          { status: 404 }
        );
      }
      
      console.log(`ID ${id} のボットを返します`);
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
    console.log(`全ボット(${bots.length}件)を返します`);
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
  console.log('POST /api/bots が呼び出されました');
  
  try {
    // Parse request body
    const body = await request.json();
    console.log('リクエストボディ:', { ...body, token: '***' });
    
    // Validate required fields
    if (!body.name || !body.clientId || !body.token) {
      console.log('必須フィールドが不足しています');
      return NextResponse.json(
        { error: "Missing required fields: name, clientId, token" },
        { status: 400 }
      );
    }
    
    // In a real implementation, this would check authentication
    // and set the userId from the authenticated user
    const userId = body.userId || "1"; // Use provided userId or fallback to mock
    console.log('使用するユーザーID:', userId);
    
    // モックモードかどうかを確認
    const useMock = request.nextUrl.searchParams.get("mock") === "true";
    
    // 本番環境ではSupabaseにのみ保存
    if (!useMock) {
      try {
        console.log('Supabaseにボットを追加を試みます');
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
        
        console.log('Supabase結果:', result ? '成功' : '失敗');
        
        if (result && result.rows && result.rows.length > 0) {
          console.log('Supabaseにボットが追加されました');
          // Don't return the encrypted token in the response
          const { encrypted_token, ...botWithoutToken } = result.rows[0];
          return NextResponse.json(botWithoutToken, { status: 201 });
        } else {
          // Supabaseへの追加に失敗した場合はエラーを返す
          console.error("Supabaseへのボット追加に失敗しました");
          return NextResponse.json(
            { error: "Failed to add bot to database" },
            { status: 500 }
          );
        }
      } catch (supabaseError) {
        console.error("Error creating bot in Supabase:", supabaseError);
        const errorMessage = supabaseError instanceof Error ? supabaseError.message : 'Unknown error';
        return NextResponse.json(
          { error: `Database error: ${errorMessage}` },
          { status: 500 }
        );
      }
    }
    // 開発環境でモックモードが指定された場合のみモックデータに追加
    else {
      console.log('モックモード: モックデータにボットを追加します');
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
      console.log('モックデータにボットが追加されました:', { id: newBot.id, name: newBot.name });
      
      // Don't return the encrypted token in the response
      const { encryptedToken, ...botWithoutToken } = newBot;
      
      return NextResponse.json(botWithoutToken, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating bot:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('エラーメッセージ:', errorMessage);
    
    return NextResponse.json(
      { error: `Failed to create bot: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for updating a bot
 */
export async function PUT(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const useMock = searchParams.get("mock") === "true"; // モックデータを使用するかどうかのフラグ
  
  console.log('PUT /api/bots が呼び出されました', { useMock });
  
  try {
    // Parse request body
    const body = await request.json();
    console.log('リクエストボディ:', { ...body, token: body.token ? '***' : undefined });
    
    // Validate required fields
    if (!body.id) {
      console.log('IDフィールドが不足しています');
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }
    
    // 本番環境ではSupabaseのみを使用
    if (!useMock) {
      try {
        console.log(`Supabaseでボット(ID: ${body.id})を更新します`);
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
          
          console.log('Supabase更新結果:', result ? '成功' : '失敗');
          
          if (result && result.rows && result.rows.length > 0) {
            console.log('Supabaseでボットが更新されました');
            // Don't return the encrypted token in the response
            const { encrypted_token, ...botWithoutToken } = result.rows[0];
            return NextResponse.json(botWithoutToken);
          } else {
            // Supabaseでの更新に失敗した場合はエラーを返す
            console.error("Supabaseでのボット更新に失敗しました");
            return NextResponse.json(
              { error: "Failed to update bot in database" },
              { status: 500 }
            );
          }
        } else {
          console.log('更新するフィールドがありません');
          return NextResponse.json(
            { error: "No fields to update" },
            { status: 400 }
          );
        }
      } catch (supabaseError) {
        console.error("Error updating bot in Supabase:", supabaseError);
        const errorMessage = supabaseError instanceof Error ? supabaseError.message : 'Unknown error';
        return NextResponse.json(
          { error: `Database error: ${errorMessage}` },
          { status: 500 }
        );
      }
    }
    // 開発環境でモックモードが指定された場合のみモックデータを更新
    else {
      console.log(`モックモード: モックデータでボット(ID: ${body.id})を更新します`);
      // Find the bot to update in mock data
      const botIndex = mockBots.findIndex(bot => bot.id === body.id);
      
      if (botIndex === -1) {
        console.log(`ID ${body.id} のボットが見つかりません`);
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
      console.log('モックデータでボットが更新されました');
      
      // Don't return the encrypted token in the response
      const { encryptedToken, ...botWithoutToken } = updatedBot;
      
      return NextResponse.json(botWithoutToken);
    }
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
  const useMock = searchParams.get("mock") === "true"; // モックデータを使用するかどうかのフラグ
  
  console.log('DELETE /api/bots が呼び出されました', { id, useMock });
  
  if (!id) {
    console.log('IDパラメータがありません');
    return NextResponse.json(
      { error: "Missing required parameter: id" },
      { status: 400 }
    );
  }
  
  // 本番環境ではSupabaseのみを使用
  if (!useMock) {
    try {
      console.log(`Supabaseからボット(ID: ${id})を削除します`);
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
      
      console.log('Supabase削除結果:', result ? '成功' : '失敗');
      
      // 成功した場合は成功レスポンスを返す
      if (result) {
        return NextResponse.json({ success: true });
      } else {
        // Supabaseでの削除に失敗した場合はエラーを返す
        console.error("Supabaseでのボット削除に失敗しました");
        return NextResponse.json(
          { error: "Failed to delete bot from database" },
          { status: 500 }
        );
      }
    } catch (supabaseError) {
      console.error("Error deleting bot from Supabase:", supabaseError);
      const errorMessage = supabaseError instanceof Error ? supabaseError.message : 'Unknown error';
      return NextResponse.json(
        { error: `Database error: ${errorMessage}` },
        { status: 500 }
      );
    }
  }
  // 開発環境でモックモードが指定された場合のみモックデータから削除
  else {
    console.log(`モックモード: モックデータからボット(ID: ${id})を削除します`);
    // Find the bot to delete from mock data
    const botIndex = mockBots.findIndex(bot => bot.id === id);
    
    if (botIndex === -1) {
      console.log(`ID ${id} のボットが見つかりません`);
      return NextResponse.json(
        { error: "Bot not found" },
        { status: 404 }
      );
    }
    
    // Remove from mock data
    mockBots.splice(botIndex, 1);
    console.log('モックデータからボットが削除されました');
    
    return NextResponse.json({ success: true });
  }
}
