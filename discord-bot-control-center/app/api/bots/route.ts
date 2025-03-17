/**
 * API route for bot management
 * Created: 2025/3/13
 * Updated: 2025/3/17 - MCPを使わずに直接Supabaseクライアントを使用するように修正
 */

import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "@/lib/encryption";
import { Bot, BotStatus, BotWithoutToken, CreateBotRequest, UpdateBotRequest } from "@/types/bot";
import { mockBots } from "./mockData";
import { botService } from "@/lib/supabase";

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
    if (useMock) {
      // モックモードの場合はモックデータを使用
      console.log('モックモード: モックデータを使用します');
      
      if (id) {
        const bot = mockBots.find(bot => bot.id === id);
        
        if (!bot) {
          console.log(`ID ${id} のボットが見つかりません`);
          return NextResponse.json(
            { error: "Bot not found" },
            { status: 404 }
          );
        }
        
        console.log(`ID ${id} のボットを返します`);
        const { encryptedToken, ...botWithoutToken } = bot;
        return NextResponse.json(botWithoutToken);
      }
      
      // Otherwise, return all bots (without tokens)
      console.log(`全ボット(${mockBots.length}件)を返します`);
      const botsWithoutTokens = mockBots.map(bot => {
        const { encryptedToken, ...botWithoutToken } = bot;
        return botWithoutToken;
      });
      
      return NextResponse.json(botsWithoutTokens);
    }
    
    // 本番モードの場合は直接Supabaseクライアントを使用
    try {
      console.log('Supabaseからボットを取得します');
      
      if (id) {
        // 特定のボットを取得
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
          return NextResponse.json(
            { error: "Invalid ID format" },
            { status: 400 }
          );
        }
        
        const bot = await botService.getBot(numericId);
        console.log(`ID ${id} のボットを返します`);
        
        // Don't return the encrypted token in the response
        const { encrypted_token, ...botWithoutToken } = bot;
        return NextResponse.json(botWithoutToken);
      }
      
      // 全ボットを取得
      const bots = await botService.getBots();
      console.log(`全ボット(${bots.length}件)を返します`);
      
      // Don't return the encrypted token in the response
      const botsWithoutTokens = bots.map(bot => {
        const { encrypted_token, ...botWithoutToken } = bot;
        return botWithoutToken;
      });
      
      return NextResponse.json(botsWithoutTokens);
    } catch (supabaseError) {
      console.error("Error fetching bots from Supabase:", supabaseError);
      
      // Supabaseからの取得に失敗した場合はエラーを返す
      return NextResponse.json(
        { error: "Failed to fetch bots from database" },
        { status: 500 }
      );
    }
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
    
    const useMock = request.nextUrl.searchParams.get("mock") === "true";
    
    if (useMock) {
      // モックモードの場合はモックデータに追加
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
    
    // 本番モードの場合は直接Supabaseクライアントを使用
    try {
      console.log('Supabaseにボットを追加します');
      
      const newBot = {
        name: body.name,
        client_id: body.clientId,
        encrypted_token: body.token, // サーバーサイドで暗号化
        user_id: userId,
        avatar_url: body.avatarUrl || null,
        status: "offline",
        settings: body.settings || {
          prefix: "!",
          autoRestart: true,
          logLevel: "info",
        }
      };
      
      const createdBot = await botService.createBot(newBot);
      console.log('Supabaseにボットが追加されました:', { id: createdBot.id, name: createdBot.name });
      
      // Don't return the encrypted token in the response
      const { encrypted_token, ...botWithoutToken } = createdBot;
      
      return NextResponse.json(botWithoutToken, { status: 201 });
    } catch (supabaseError) {
      console.error("Error creating bot in Supabase:", supabaseError);
      
      // Supabaseへの追加に失敗した場合はエラーを返す
      return NextResponse.json(
        { error: "Failed to create bot in database" },
        { status: 500 }
      );
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
    
    if (useMock) {
      // モックモードの場合はモックデータを更新
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
    
    // 本番モードの場合は直接Supabaseクライアントを使用
    try {
      console.log(`Supabaseでボット(ID: ${body.id})を更新します`);
      
      const numericId = parseInt(body.id, 10);
      if (isNaN(numericId)) {
        return NextResponse.json(
          { error: "Invalid ID format" },
          { status: 400 }
        );
      }
      
      // 更新するフィールドを準備
      const updateData: any = {};
      
      if (body.name) updateData.name = body.name;
      if (body.clientId) updateData.client_id = body.clientId;
      if (body.token) updateData.encrypted_token = body.token;
      if (body.avatarUrl !== undefined) updateData.avatar_url = body.avatarUrl;
      if (body.status) updateData.status = body.status;
      if (body.settings) updateData.settings = { ...body.settings };
      
      if (Object.keys(updateData).length === 0) {
        console.log('更新するフィールドがありません');
        return NextResponse.json(
          { error: "No fields to update" },
          { status: 400 }
        );
      }
      
      // ボットを更新
      const updatedBot = await botService.updateBot(numericId, updateData);
      console.log('Supabaseでボットが更新されました');
      
      // Don't return the encrypted token in the response
      const { encrypted_token, ...botWithoutToken } = updatedBot;
      
      return NextResponse.json(botWithoutToken);
    } catch (supabaseError) {
      console.error("Error updating bot in Supabase:", supabaseError);
      
      // Supabaseでの更新に失敗した場合はエラーを返す
      return NextResponse.json(
        { error: "Failed to update bot in database" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating bot:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to update bot: ${errorMessage}` },
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
  
  if (useMock) {
    // モックモードの場合はモックデータから削除
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
  
  // 本番モードの場合は直接Supabaseクライアントを使用
  try {
    console.log(`Supabaseからボット(ID: ${id})を削除します`);
    
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }
    
    // ボットを削除
    await botService.deleteBot(numericId);
    console.log('Supabaseからボットが削除されました');
    
    return NextResponse.json({ success: true });
  } catch (supabaseError) {
    console.error("Error deleting bot from Supabase:", supabaseError);
    
    // Supabaseでの削除に失敗した場合はエラーを返す
    return NextResponse.json(
      { error: "Failed to delete bot from database" },
      { status: 500 }
    );
  }
}
