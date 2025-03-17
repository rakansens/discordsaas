// MCPツール使用APIエンドポイント

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
 * MCPツールを使用するためのAPIエンドポイント
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
    const { server_name, tool_name, arguments: args } = body;
    
    console.log('MCP tool request:', { server_name, tool_name, args });
    
    // バリデーション
    if (!server_name || !tool_name || !args) {
      console.error('Missing required parameters:', { server_name, tool_name, args });
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
    
    // MCPツールの実行
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
            method: 'tools/call',
            params: {
              name: tool_name,
              arguments: args
            }
          }
        ];
        
        console.log('MCP request:', batchRequest);
        
        // 標準入力を通じてリクエストを送信
        const command = `${serverConfig.command} ${(serverConfig.args || []).join(' ')}`;
        console.log('Executing command:', command);
        
        // 子プロセスを直接制御して標準入力を使用
        const { spawn } = require('child_process');
        const child = spawn(serverConfig.command, serverConfig.args || [], { env });
        
        // リクエストを標準入力に書き込む
        child.stdin.write(JSON.stringify(batchRequest));
        child.stdin.end();
        
        // 標準出力と標準エラー出力を収集
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data: Buffer) => {
          stdout += data.toString();
        });
        
        child.stderr.on('data', (data: Buffer) => {
          stderr += data.toString();
        });
        
        // プロセスの終了を待つ
        const exitCode = await new Promise((resolve) => {
          child.on('close', resolve);
        });
        
        if (exitCode !== 0) {
          console.error(`MCP server exited with code ${exitCode}`);
          console.error('stderr:', stderr);
          throw new Error(`MCP server exited with code ${exitCode}`);
        }
        
        console.log('MCP server stdout:', stdout);
        
        if (stderr) {
          console.error('MCP server stderr:', stderr);
        }
        
        // 結果をパース
        let response;
        try {
          // 出力が複数行のJSONの場合、最後の有効なJSONを取得
          const jsonLines = stdout.trim().split('\n');
          let lastValidJson = null;
          
          // 各行を処理し、最後の有効なJSONオブジェクトを探す
          for (const line of jsonLines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            try {
              const parsed = JSON.parse(trimmedLine);
              if (parsed && typeof parsed === 'object') {
                // 2番目のリクエスト（tools/call）の応答を探す
                if (parsed.id && !parsed.id.toString().startsWith('init-')) {
                  lastValidJson = parsed;
                }
              }
            } catch (e) {
              // このラインは有効なJSONではない、スキップ
              console.log('Invalid JSON line:', trimmedLine);
            }
          }
          
          if (lastValidJson) {
            response = lastValidJson;
          } else {
            // 有効なJSONが見つからない場合、全体を解析してみる
            try {
              response = JSON.parse(stdout);
            } catch (e) {
              // 全体も解析できない場合は、特定のパターンを探す
              // Supabase MCPサーバーの場合、結果が特定のフォーマットで返ってくる可能性がある
              const resultMatch = stdout.match(/\{[\s\S]*?\}/);
              if (resultMatch) {
                try {
                  response = JSON.parse(resultMatch[0]);
                } catch (innerErr) {
                  // それでも解析できない場合は、エラーを投げる
                  throw new Error('Could not parse MCP server response');
                }
              } else {
                // パターンも見つからない場合は、エラーを投げる
                throw new Error('Could not parse MCP server response');
              }
            }
          }
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
            { message: response.error.message || 'MCP tool execution failed', error: response.error },
            { status: 500 }
          );
        }
        
        // 応答からresultを取得
        let result;
        if (response.result) {
          result = response.result;
        } else if (response.content && response.content.length > 0 && response.content[0].text) {
          // content配列からテキストを取得する場合
          result = response.content[0].text;
        } else if (response.content) {
          // contentが直接値の場合
          result = response.content;
        } else {
          // 応答全体を返す
          result = response;
        }
        
        console.log('MCP tool result:', result);
        
        return NextResponse.json({
          result: result
        });
      } catch (err: any) {
        console.error('Error executing MCP tool:', err);
        return NextResponse.json(
          { message: 'Error executing MCP tool', error: err.message },
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
    console.error('Error using MCP tool:', error);
    
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
