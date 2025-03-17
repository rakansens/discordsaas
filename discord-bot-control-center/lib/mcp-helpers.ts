// MCP（Model Context Protocol）ヘルパー関数

/**
 * MCPツールを使用するためのヘルパー関数
 * 
 * @param params MCPツール使用パラメータ
 * @returns MCPツールの実行結果
 */
export const use_mcp_tool = async <T = any>(params: {
  server_name: string;
  tool_name: string;
  arguments: Record<string, any>;
}): Promise<T> => {
  try {
    // 実際の環境では、MCPツールを使用するためのAPIエンドポイントを呼び出す
    // サーバーサイドかクライアントサイドかで処理を分ける
    const isServer = typeof window === 'undefined';
    const baseUrl = isServer 
      ? process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      : '';
    
    const response = await fetch(`${baseUrl}/api/mcp/use-tool`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`MCP tool execution failed: ${errorData.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error using MCP tool:', error);
    throw error;
  }
};

/**
 * MCPリソースにアクセスするためのヘルパー関数
 * 
 * @param params MCPリソースアクセスパラメータ
 * @returns MCPリソースの内容
 */
export const access_mcp_resource = async <T = any>(params: {
  server_name: string;
  uri: string;
}): Promise<T> => {
  try {
    // 実際の環境では、MCPリソースにアクセスするためのAPIエンドポイントを呼び出す
    // サーバーサイドかクライアントサイドかで処理を分ける
    const isServer = typeof window === 'undefined';
    const baseUrl = isServer 
      ? process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      : '';
    
    const response = await fetch(`${baseUrl}/api/mcp/access-resource`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`MCP resource access failed: ${errorData.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error accessing MCP resource:', error);
    throw error;
  }
};
