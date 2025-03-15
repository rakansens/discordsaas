/**
 * API route for bot status management
 * Created: 2025/3/13
 */

import { NextRequest, NextResponse } from "next/server";
import { Bot, BotStatus } from "@/types/bot";

// In a real implementation, this would be imported from a database service
// For now, we'll use a reference to the mock data from the bots API
// This is just for demonstration purposes
import { mockBots } from "../mockData";

interface StatusUpdateRequest {
  botId: string;
  status: BotStatus;
}

/**
 * POST handler for updating bot status
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: StatusUpdateRequest = await request.json();
    
    // Validate required fields
    if (!body.botId || !body.status) {
      return NextResponse.json(
        { error: "Missing required fields: botId, status" },
        { status: 400 }
      );
    }
    
    // Validate status value
    const validStatuses: BotStatus[] = ["online", "offline", "error", "starting", "stopping"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status value. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }
    
    // Find the bot to update
    const botIndex = mockBots.findIndex((bot: Bot) => bot.id === body.botId);
    
    if (botIndex === -1) {
      return NextResponse.json(
        { error: "Bot not found" },
        { status: 404 }
      );
    }
    
    // In a real implementation, this would check authentication
    // and verify that the user owns the bot
    
    // In a real implementation, this would actually start/stop the bot process
    // For now, we'll just update the status
    
    // Update the bot status
    mockBots[botIndex] = {
      ...mockBots[botIndex],
      status: body.status,
      lastActive: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Don't return the encrypted token in the response
    const { encryptedToken, ...botWithoutToken } = mockBots[botIndex];
    
    return NextResponse.json(botWithoutToken);
  } catch (error) {
    console.error("Error updating bot status:", error);
    return NextResponse.json(
      { error: "Failed to update bot status" },
      { status: 500 }
    );
  }
}

/**
 * GET handler for retrieving bot status
 */
export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const botId = searchParams.get("botId");
  
  if (!botId) {
    return NextResponse.json(
      { error: "Missing required parameter: botId" },
      { status: 400 }
    );
  }
  
  // Find the bot
  const bot = mockBots.find((bot: Bot) => bot.id === botId);
  
  if (!bot) {
    return NextResponse.json(
      { error: "Bot not found" },
      { status: 404 }
    );
  }
  
  // In a real implementation, this would check authentication
  // and verify that the user has access to the bot
  
  // Return just the status information
  return NextResponse.json({
    id: bot.id,
    status: bot.status,
    lastActive: bot.lastActive
  });
}
