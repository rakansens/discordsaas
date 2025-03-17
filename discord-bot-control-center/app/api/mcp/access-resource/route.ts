// MCPリソースアクセスAPIエンドポイント

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

// execをPromise化
const execAsync = promisify(exec);

/**
 * MCPリソースにアクセスするためのAPIエンドポイント
 * 
 * @param req リクエスト
 * @returns レスポンス
 */
export async function POST(req: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    
    if (!session && process.env.SKIP_AUTH !== 'true') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // リクエストボディの取得
    const body = await req.json();
    const { server_name, uri } = body;
    
    console.log('MCP resource request:', { server_name, uri });
    
    // バリデーション
    if (!server_name || !uri) {
      console.error('Missing required parameters:', { server_name, uri });
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // MCPサーバー設定ファイルのパス
    const settingsPath = path.join(process.cwd(), '.mcp-settings.json');
    console.log('MCP settings path:', settingsPath);
    
    // 設定ファイルが存在するか確認
    let mcpSettings;
    try {
      const settingsContent = await fs.readFile(settingsPath, 'utf-8');
      console.log('MCP settings content:', settingsContent);
      mcpSettings = JSON.parse(settingsContent);
    } catch (err: any) {
      console.error('Error reading MCP settings file:', err);
      return NextResponse.json(
        { message: 'MCP settings file not found or invalid', error: err.message },
        { status: 500 }
      );
    }
    
    // サーバー設定の取得
    const serverConfig = mcpSettings.mcpServers[server_name];
    if (!serverConfig) {
      console.error(`MCP server "${server_name}" not found in settings`);
      return NextResponse.json(
        { message: `MCP server "${server_name}" not found in settings` },
        { status: 400 }
      );
    }
    
    console.log('Server config:', serverConfig);
    
    // MCPリソースへのアクセス
    // Supabase MCPサーバーの場合は直接実行
    if (server_name === 'discord-bot-supabase-mcp') {
      try {
        // 環境変数の設定
        const env = {
          ...process.env,
          ...serverConfig.env
        };
        
        // 初期化と実際のリクエストを含むバッチリクエストを作成
        const batchRequest = [
          {
            jsonrpc: '2.0',
            id: 'init-' + Date.now().toString(),
            method: 'initialize',
            params: {
              protocolVersion: '0.1.0',
              capabilities: {},
              clientInfo: {
                name: 'discord-bot-control-center',
                version: '0.1.0'
              }
            }
          },
          {
            jsonrpc: '2.0',
            id: Date.now().toString(),
            method: 'resources/read',
            params: {
              uri: uri
            }
          }
        ];
        
        console.log('MCP request:', batchRequest);
        
        // 一時ファイルに保存
        const tempFilePath = path.join(process.cwd(), '.mcp-request.json');
        await fs.writeFile(tempFilePath, JSON.stringify(batchRequest));
        
        // MCPサーバーを実行
        const command = `${serverConfig.command} ${(serverConfig.args || []).join(' ')} < ${tempFilePath}`;
        console.log('Executing command:', command);
        
        const { stdout, stderr } = await execAsync(command, { env });
        
        // 一時ファイルを削除
        await fs.unlink(tempFilePath);
        
        if (stderr) {
          console.error('MCP server stderr:', stderr);
        }
        
        console.log('MCP server stdout:', stdout);
        
        // 結果をパース
        let response;
        try {
          response = JSON.parse(stdout);
        } catch (parseErr: any) {
          console.error('Error parsing MCP server response:', parseErr);
          console.error('Raw response:', stdout);
          return NextResponse.json(
            { message: 'Invalid response from MCP server', error: parseErr.message, raw: stdout },
            { status: 500 }
          );
        }
        
        if (response.error) {
          console.error('MCP server error:', response.error);
          return NextResponse.json(
            { message: response.error.message || 'MCP resource access failed', error: response.error },
            { status: 500 }
          );
        }
        
        console.log('MCP resource result:', response.result);
        
        return NextResponse.json({
          result: response.result
        });
      } catch (err: any) {
        console.error('Error accessing MCP resource:', err);
        return NextResponse.json(
          { message: 'Error accessing MCP resource', error: err.message },
          { status: 500 }
        );
      }
    }
    
    // サポートされていないMCPサーバー
    console.error('Unsupported MCP server:', server_name);
    return NextResponse.json(
      { message: 'Unsupported MCP server' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error accessing MCP resource:', error);
    
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
