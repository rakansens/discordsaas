/**
 * API route for command management
 * Created: 2025/3/13
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  Command, 
  CommandOption, 
  CommandPrompt, 
  CommandWithPrompt, 
  CreateCommandRequest, 
  UpdateCommandRequest 
} from "@/types/command";

// Mock data for development
// In a real implementation, this would be stored in Supabase
let mockCommands: Command[] = [
  {
    id: "1",
    botId: "1",
    name: "ban",
    description: "ユーザーをBANします",
    usage: "/ban @user [reason]",
    options: [
      { name: "user", description: "BANするユーザー", type: "user", required: true },
      { name: "reason", description: "BAN理由", type: "string", required: false }
    ],
    promptId: "1",
    enabled: true,
    createdAt: "2025-01-20T14:30:00Z",
    updatedAt: "2025-03-10T09:15:00Z"
  },
  {
    id: "2",
    botId: "1",
    name: "kick",
    description: "ユーザーをキックします",
    usage: "/kick @user [reason]",
    options: [
      { name: "user", description: "キックするユーザー", type: "user", required: true },
      { name: "reason", description: "キック理由", type: "string", required: false }
    ],
    promptId: null,
    enabled: true,
    createdAt: "2025-01-25T11:20:00Z",
    updatedAt: "2025-02-15T16:45:00Z"
  },
  {
    id: "3",
    botId: "2",
    name: "play",
    description: "音楽を再生します",
    usage: "/play [song]",
    options: [
      { name: "song", description: "曲名またはURL", type: "string", required: true }
    ],
    promptId: null,
    enabled: true,
    createdAt: "2025-02-05T10:00:00Z",
    updatedAt: "2025-03-01T13:30:00Z"
  },
  {
    id: "4",
    botId: "3",
    name: "poll",
    description: "投票を作成します",
    usage: "/poll [question] [options]",
    options: [
      { name: "question", description: "質問", type: "string", required: true },
      { name: "options", description: "選択肢（カンマ区切り）", type: "string", required: true }
    ],
    promptId: "2",
    enabled: true,
    createdAt: "2025-02-20T09:45:00Z",
    updatedAt: "2025-03-05T14:20:00Z"
  },
  {
    id: "5",
    botId: "4",
    name: "ask",
    description: "AIに質問します",
    usage: "/ask [question]",
    options: [
      { name: "question", description: "質問内容", type: "string", required: true }
    ],
    promptId: "3",
    enabled: true,
    createdAt: "2025-03-02T15:30:00Z",
    updatedAt: "2025-03-12T11:15:00Z"
  }
];

// Mock prompts data
let mockPrompts: CommandPrompt[] = [
  {
    id: "1",
    commandId: "1",
    content: "ユーザー {user} を {reason} の理由でBANしました。",
    variables: ["user", "reason"],
    apiIntegration: null
  },
  {
    id: "2",
    commandId: "4",
    content: "投票: {question}\n\n選択肢:\n{options}",
    variables: ["question", "options"],
    apiIntegration: null
  },
  {
    id: "3",
    commandId: "5",
    content: "質問: {question}\n\n回答を生成中...",
    variables: ["question"],
    apiIntegration: "openai"
  }
];

/**
 * GET handler for retrieving commands
 */
export async function GET(request: NextRequest) {
  // In a real implementation, this would check authentication
  
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const botId = searchParams.get("botId");
  
  // If ID is provided, return a specific command
  if (id) {
    const command = mockCommands.find(cmd => cmd.id === id);
    
    if (!command) {
      return NextResponse.json(
        { error: "Command not found" },
        { status: 404 }
      );
    }
    
    // Include prompt if available
    const prompt = command.promptId 
      ? mockPrompts.find(p => p.id === command.promptId) 
      : undefined;
    
    const commandWithPrompt: CommandWithPrompt = {
      ...command,
      prompt
    };
    
    return NextResponse.json(commandWithPrompt);
  }
  
  // If botId is provided, filter commands by bot
  let filteredCommands = mockCommands;
  if (botId) {
    filteredCommands = mockCommands.filter(cmd => cmd.botId === botId);
  }
  
  // Include prompts with commands
  const commandsWithPrompts: CommandWithPrompt[] = filteredCommands.map(command => {
    const prompt = command.promptId 
      ? mockPrompts.find(p => p.id === command.promptId) 
      : undefined;
    
    return {
      ...command,
      prompt
    };
  });
  
  return NextResponse.json(commandsWithPrompts);
}

/**
 * POST handler for creating a new command
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: CreateCommandRequest = await request.json();
    
    // Validate required fields
    if (!body.botId || !body.name || !body.description || !body.usage) {
      return NextResponse.json(
        { error: "Missing required fields: botId, name, description, usage" },
        { status: 400 }
      );
    }
    
    // In a real implementation, this would check authentication
    // and verify that the user owns the bot
    
    // Create a new command
    const newCommand: Command = {
      id: (mockCommands.length + 1).toString(),
      botId: body.botId,
      name: body.name,
      description: body.description,
      usage: body.usage,
      options: body.options || [],
      promptId: null, // Will be set if prompt is provided
      enabled: body.enabled !== undefined ? body.enabled : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Create prompt if provided
    let prompt: CommandPrompt | undefined;
    if (body.prompt) {
      prompt = {
        id: (mockPrompts.length + 1).toString(),
        commandId: newCommand.id,
        content: body.prompt.content,
        variables: body.prompt.variables,
        apiIntegration: body.prompt.apiIntegration || null
      };
      
      // Set promptId in command
      newCommand.promptId = prompt.id;
      
      // Add to mock prompts
      mockPrompts.push(prompt);
    }
    
    // Add to mock commands
    mockCommands.push(newCommand);
    
    // Return command with prompt
    const commandWithPrompt: CommandWithPrompt = {
      ...newCommand,
      prompt
    };
    
    return NextResponse.json(commandWithPrompt, { status: 201 });
  } catch (error) {
    console.error("Error creating command:", error);
    return NextResponse.json(
      { error: "Failed to create command" },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for updating a command
 */
export async function PUT(request: NextRequest) {
  try {
    // Parse request body
    const body: UpdateCommandRequest = await request.json();
    
    // Validate required fields
    if (!body.id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }
    
    // Find the command to update
    const commandIndex = mockCommands.findIndex(cmd => cmd.id === body.id);
    
    if (commandIndex === -1) {
      return NextResponse.json(
        { error: "Command not found" },
        { status: 404 }
      );
    }
    
    // In a real implementation, this would check authentication
    // and verify that the user owns the bot
    
    // Update the command
    const updatedCommand: Command = {
      ...mockCommands[commandIndex],
      name: body.name || mockCommands[commandIndex].name,
      description: body.description || mockCommands[commandIndex].description,
      usage: body.usage || mockCommands[commandIndex].usage,
      options: body.options || mockCommands[commandIndex].options,
      enabled: body.enabled !== undefined ? body.enabled : mockCommands[commandIndex].enabled,
      updatedAt: new Date().toISOString()
    };
    
    // Handle prompt update
    let updatedPrompt: CommandPrompt | undefined;
    
    if (body.prompt === null) {
      // Remove prompt if explicitly set to null
      if (updatedCommand.promptId) {
        // Remove from mock prompts
        const promptIndex = mockPrompts.findIndex(p => p.id === updatedCommand.promptId);
        if (promptIndex !== -1) {
          mockPrompts.splice(promptIndex, 1);
        }
        
        // Clear promptId in command
        updatedCommand.promptId = null;
      }
    } else if (body.prompt) {
      // Update existing prompt or create new one
      if (updatedCommand.promptId) {
        // Update existing prompt
        const promptIndex = mockPrompts.findIndex(p => p.id === updatedCommand.promptId);
        if (promptIndex !== -1) {
          updatedPrompt = {
            ...mockPrompts[promptIndex],
            content: body.prompt.content,
            variables: body.prompt.variables,
            apiIntegration: body.prompt.apiIntegration !== undefined 
              ? body.prompt.apiIntegration 
              : mockPrompts[promptIndex].apiIntegration
          };
          
          // Update in mock prompts
          mockPrompts[promptIndex] = updatedPrompt;
        }
      } else {
        // Create new prompt
        updatedPrompt = {
          id: (mockPrompts.length + 1).toString(),
          commandId: updatedCommand.id,
          content: body.prompt.content,
          variables: body.prompt.variables,
          apiIntegration: body.prompt.apiIntegration || null
        };
        
        // Set promptId in command
        updatedCommand.promptId = updatedPrompt.id;
        
        // Add to mock prompts
        mockPrompts.push(updatedPrompt);
      }
    } else {
      // If prompt not specified, keep existing prompt
      updatedPrompt = updatedCommand.promptId 
        ? mockPrompts.find(p => p.id === updatedCommand.promptId) 
        : undefined;
    }
    
    // Update in mock commands
    mockCommands[commandIndex] = updatedCommand;
    
    // Return command with prompt
    const commandWithPrompt: CommandWithPrompt = {
      ...updatedCommand,
      prompt: updatedPrompt
    };
    
    return NextResponse.json(commandWithPrompt);
  } catch (error) {
    console.error("Error updating command:", error);
    return NextResponse.json(
      { error: "Failed to update command" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for deleting a command
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
  
  // Find the command to delete
  const commandIndex = mockCommands.findIndex(cmd => cmd.id === id);
  
  if (commandIndex === -1) {
    return NextResponse.json(
      { error: "Command not found" },
      { status: 404 }
    );
  }
  
  // In a real implementation, this would check authentication
  // and verify that the user owns the bot
  
  // Get the command to delete
  const commandToDelete = mockCommands[commandIndex];
  
  // If command has a prompt, delete it too
  if (commandToDelete.promptId) {
    const promptIndex = mockPrompts.findIndex(p => p.id === commandToDelete.promptId);
    if (promptIndex !== -1) {
      mockPrompts.splice(promptIndex, 1);
    }
  }
  
  // Remove from mock commands
  mockCommands.splice(commandIndex, 1);
  
  return NextResponse.json({ success: true });
}
