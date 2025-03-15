/**
 * API route for bot management
 * Created: 2025/3/13
 */

import { NextRequest, NextResponse } from "next/server";
import { encrypt, decrypt } from "@/lib/encryption";
import { Bot, BotStatus, BotWithoutToken, CreateBotRequest, UpdateBotRequest } from "@/types/bot";
import { mockBots } from "./mockData";

/**
 * GET handler for retrieving bots
 */
export async function GET(request: NextRequest) {
  // In a real implementation, this would check authentication
  // and filter bots by the authenticated user's ID
  
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  
  // If ID is provided, return a specific bot
  if (id) {
    const bot = mockBots.find(bot => bot.id === id);
    
    if (!bot) {
      return NextResponse.json(
        { error: "Bot not found" },
        { status: 404 }
      );
    }
    
    // Don't return the encrypted token in the response
    const { encryptedToken, ...botWithoutToken } = bot;
    
    return NextResponse.json(botWithoutToken);
  }
  
  // Otherwise, return all bots (without tokens)
  const botsWithoutTokens = mockBots.map(({ encryptedToken, ...bot }) => bot);
  
  return NextResponse.json(botsWithoutTokens);
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
    
    // Create a new bot
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
    
    // Find the bot to update
    const botIndex = mockBots.findIndex(bot => bot.id === body.id);
    
    if (botIndex === -1) {
      return NextResponse.json(
        { error: "Bot not found" },
        { status: 404 }
      );
    }
    
    // In a real implementation, this would check authentication
    // and verify that the user owns the bot
    
    // Update the bot
    const updatedBot = {
      ...mockBots[botIndex],
      name: body.name || mockBots[botIndex].name,
      clientId: body.clientId || mockBots[botIndex].clientId,
      encryptedToken: body.token ? encrypt(body.token) : mockBots[botIndex].encryptedToken,
      avatarUrl: body.avatarUrl !== undefined ? body.avatarUrl : mockBots[botIndex].avatarUrl,
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
  
  // Find the bot to delete
  const botIndex = mockBots.findIndex(bot => bot.id === id);
  
  if (botIndex === -1) {
    return NextResponse.json(
      { error: "Bot not found" },
      { status: 404 }
    );
  }
  
  // In a real implementation, this would check authentication
  // and verify that the user owns the bot
  
  // Remove from mock data
  mockBots.splice(botIndex, 1);
  
  return NextResponse.json({ success: true });
}
