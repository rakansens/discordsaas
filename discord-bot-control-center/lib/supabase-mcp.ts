// Supabase MCP連携

import { use_mcp_tool } from '@/lib/mcp-helpers';

/**
 * Supabase MCPサーバーを使用してデータベースに接続し、操作を行うためのヘルパー関数
 */

// データベースの書き込みモードを有効化
export const enableDatabaseWriteMode = async () => {
  try {
    const result = await use_mcp_tool({
      server_name: 'discord-bot-supabase-mcp',
      tool_name: 'live_dangerously',
      arguments: {
        service: 'database',
        enable: true
      }
    });
    
    console.log('Database write mode enabled:', result);
    return result;
  } catch (error) {
    console.error('Error enabling database write mode:', error);
    throw error;
  }
};

// データベーススキーマの取得
export const getDatabaseSchemas = async () => {
  try {
    const result = await use_mcp_tool({
      server_name: 'discord-bot-supabase-mcp',
      tool_name: 'get_db_schemas',
      arguments: {}
    });
    
    return result;
  } catch (error) {
    console.error('Error getting database schemas:', error);
    throw error;
  }
};

// テーブル一覧の取得
export const getTables = async (schema_name: string) => {
  try {
    const result = await use_mcp_tool({
      server_name: 'discord-bot-supabase-mcp',
      tool_name: 'get_tables',
      arguments: {
        schema_name
      }
    });
    
    return result;
  } catch (error) {
    console.error(`Error getting tables for schema ${schema_name}:`, error);
    throw error;
  }
};

// テーブルスキーマの取得
export const getTableSchema = async (schema_name: string, table: string) => {
  try {
    const result = await use_mcp_tool({
      server_name: 'discord-bot-supabase-mcp',
      tool_name: 'get_table_schema',
      arguments: {
        schema_name,
        table
      }
    });
    
    return result;
  } catch (error) {
    console.error(`Error getting schema for table ${schema_name}.${table}:`, error);
    throw error;
  }
};

// SQLクエリの実行
export const executeSqlQuery = async (queryInput: string | { query: string; params: any[] }) => {
  try {
    let query: string;
    
    if (typeof queryInput === 'string') {
      // 文字列の場合はそのまま使用
      query = queryInput;
    } else {
      // パラメータ化されたクエリの場合は、パラメータを置換
      query = queryInput.query;
      
      // パラメータがある場合は置換
      if (queryInput.params && queryInput.params.length > 0) {
        // 現在のSupabase MCPサーバーはパラメータ化クエリをサポートしていないため、
        // 手動でパラメータを置換する
        queryInput.params.forEach((param, index) => {
          const placeholder = `$${index + 1}`;
          
          // 文字列の場合はエスケープ
          let paramValue = param;
          if (typeof param === 'string') {
            paramValue = `'${param.replace(/'/g, "''")}'`;
          } else if (param === null) {
            paramValue = 'NULL';
          }
          
          // プレースホルダーを実際の値で置換
          query = query.replace(placeholder, paramValue);
        });
      }
    }
    
    const result = await use_mcp_tool({
      server_name: 'discord-bot-supabase-mcp',
      tool_name: 'execute_sql_query',
      arguments: {
        query
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error executing SQL query:', error);
    throw error;
  }
};

// ボット一覧の取得
export const fetchBots = async () => {
  try {
    const result = await executeSqlQuery('SELECT * FROM public.bots ORDER BY created_at DESC;');
    return result.rows;
  } catch (error) {
    console.error('Error fetching bots:', error);
    throw error;
  }
};

// ボット詳細の取得
export const fetchBot = async (id: number) => {
  try {
    const result = await executeSqlQuery(`SELECT * FROM public.bots WHERE id = ${id};`);
    return result.rows[0];
  } catch (error) {
    console.error(`Error fetching bot with id ${id}:`, error);
    throw error;
  }
};

// ボットの作成
export const createBot = async (name: string, client_id: string, encrypted_token: string, user_id: string, avatar_url?: string) => {
  try {
    // 書き込みモードを有効化
    await enableDatabaseWriteMode();
    
    const query = `
      BEGIN;
      INSERT INTO public.bots (name, client_id, encrypted_token, user_id, avatar_url, status, settings)
      VALUES ('${name}', '${client_id}', '${encrypted_token}', '${user_id}', ${avatar_url ? `'${avatar_url}'` : 'NULL'}, 'offline', '{}')
      RETURNING *;
      COMMIT;
    `;
    
    const result = await executeSqlQuery(query);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating bot:', error);
    throw error;
  }
};

// ボットの更新
export const updateBot = async (id: number, updates: { name?: string, client_id?: string, encrypted_token?: string, avatar_url?: string, status?: string, settings?: Record<string, any> }) => {
  try {
    // 書き込みモードを有効化
    await enableDatabaseWriteMode();
    
    // 更新するフィールドを構築
    const updateFields = Object.entries(updates)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => {
        if (key === 'settings') {
          return `${key} = '${JSON.stringify(value)}'`;
        }
        return `${key} = '${value}'`;
      })
      .join(', ');
    
    if (!updateFields) {
      throw new Error('No fields to update');
    }
    
    const query = `
      BEGIN;
      UPDATE public.bots
      SET ${updateFields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *;
      COMMIT;
    `;
    
    const result = await executeSqlQuery(query);
    return result.rows[0];
  } catch (error) {
    console.error(`Error updating bot with id ${id}:`, error);
    throw error;
  }
};

// ボットの削除
export const deleteBot = async (id: number) => {
  try {
    // 書き込みモードを有効化
    await enableDatabaseWriteMode();
    
    const query = `
      BEGIN;
      DELETE FROM public.bots WHERE id = ${id};
      COMMIT;
    `;
    
    await executeSqlQuery(query);
    return true;
  } catch (error) {
    console.error(`Error deleting bot with id ${id}:`, error);
    throw error;
  }
};

// コマンド一覧の取得
export const fetchCommands = async (botId?: number) => {
  try {
    let query = 'SELECT * FROM public.commands';
    
    if (botId) {
      query += ` WHERE bot_id = ${botId}`;
    }
    
    query += ' ORDER BY created_at DESC;';
    
    const result = await executeSqlQuery(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching commands:', error);
    throw error;
  }
};

// コマンド詳細の取得
export const fetchCommand = async (id: number) => {
  try {
    const commandResult = await executeSqlQuery(`SELECT * FROM public.commands WHERE id = ${id};`);
    
    if (commandResult.rows.length === 0) {
      throw new Error(`Command with id ${id} not found`);
    }
    
    const command = commandResult.rows[0];
    
    // プロンプト情報も取得
    if (command.prompt_id) {
      const promptResult = await executeSqlQuery(`SELECT * FROM public.prompts WHERE id = ${command.prompt_id};`);
      
      if (promptResult.rows.length > 0) {
        return {
          ...command,
          prompt: promptResult.rows[0]
        };
      }
    }
    
    return command;
  } catch (error) {
    console.error(`Error fetching command with id ${id}:`, error);
    throw error;
  }
};

// コマンドの作成
export const createCommand = async (
  botId: number,
  name: string,
  description: string,
  options: any[] = [],
  promptContent?: string,
  promptVariables?: string[],
  apiIntegration?: Record<string, any>
) => {
  try {
    // 書き込みモードを有効化
    await enableDatabaseWriteMode();
    
    let query = `
      BEGIN;
      INSERT INTO public.commands (bot_id, name, description, options, enabled)
      VALUES (${botId}, '${name}', '${description}', '${JSON.stringify(options)}', true)
      RETURNING *;
    `;
    
    // プロンプトがある場合は作成
    if (promptContent) {
      query += `
        WITH new_command AS (
          SELECT id FROM public.commands
          ORDER BY created_at DESC
          LIMIT 1
        )
        INSERT INTO public.prompts (command_id, content, variables, api_integration)
        VALUES (
          (SELECT id FROM new_command),
          '${promptContent}',
          '${JSON.stringify(promptVariables || [])}',
          '${JSON.stringify(apiIntegration || {})}'
        )
        RETURNING id;
        
        UPDATE public.commands
        SET prompt_id = (
          SELECT id FROM public.prompts
          ORDER BY created_at DESC
          LIMIT 1
        )
        WHERE id = (
          SELECT id FROM public.commands
          ORDER BY created_at DESC
          LIMIT 1
        );
      `;
    }
    
    query += 'COMMIT;';
    
    const result = await executeSqlQuery(query);
    
    // 作成したコマンドを取得
    const commandResult = await executeSqlQuery(`
      SELECT * FROM public.commands
      ORDER BY created_at DESC
      LIMIT 1;
    `);
    
    return commandResult.rows[0];
  } catch (error) {
    console.error('Error creating command:', error);
    throw error;
  }
};

// コマンドの更新
export const updateCommand = async (
  id: number,
  updates: {
    name?: string,
    description?: string,
    options?: any[],
    enabled?: boolean,
    promptContent?: string,
    promptVariables?: string[],
    apiIntegration?: Record<string, any>
  }
) => {
  try {
    // 書き込みモードを有効化
    await enableDatabaseWriteMode();
    
    // コマンド更新フィールドを構築
    const commandUpdateFields = Object.entries(updates)
      .filter(([key, _]) => ['name', 'description', 'options', 'enabled'].includes(key))
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => {
        if (key === 'options') {
          return `${key} = '${JSON.stringify(value)}'`;
        }
        if (key === 'enabled') {
          return `${key} = ${value}`;
        }
        return `${key} = '${value}'`;
      })
      .join(', ');
    
    let query = 'BEGIN;';
    
    // コマンド更新フィールドがある場合
    if (commandUpdateFields) {
      query += `
        UPDATE public.commands
        SET ${commandUpdateFields}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id};
      `;
    }
    
    // プロンプト関連の更新がある場合
    if (updates.promptContent !== undefined || updates.promptVariables !== undefined || updates.apiIntegration !== undefined) {
      // 現在のコマンド情報を取得
      const commandResult = await executeSqlQuery(`SELECT * FROM public.commands WHERE id = ${id};`);
      
      if (commandResult.rows.length === 0) {
        throw new Error(`Command with id ${id} not found`);
      }
      
      const command = commandResult.rows[0];
      
      // プロンプトがある場合は更新、なければ作成
      if (command.prompt_id) {
        const promptUpdateFields = [];
        
        if (updates.promptContent !== undefined) {
          promptUpdateFields.push(`content = '${updates.promptContent}'`);
        }
        
        if (updates.promptVariables !== undefined) {
          promptUpdateFields.push(`variables = '${JSON.stringify(updates.promptVariables)}'`);
        }
        
        if (updates.apiIntegration !== undefined) {
          promptUpdateFields.push(`api_integration = '${JSON.stringify(updates.apiIntegration)}'`);
        }
        
        if (promptUpdateFields.length > 0) {
          query += `
            UPDATE public.prompts
            SET ${promptUpdateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${command.prompt_id};
          `;
        }
      } else if (updates.promptContent) {
        // 新しいプロンプトを作成
        query += `
          INSERT INTO public.prompts (command_id, content, variables, api_integration)
          VALUES (
            ${id},
            '${updates.promptContent}',
            '${JSON.stringify(updates.promptVariables || [])}',
            '${JSON.stringify(updates.apiIntegration || {})}'
          )
          RETURNING id;
          
          UPDATE public.commands
          SET prompt_id = (
            SELECT id FROM public.prompts
            ORDER BY created_at DESC
            LIMIT 1
          )
          WHERE id = ${id};
        `;
      }
    }
    
    query += 'COMMIT;';
    
    await executeSqlQuery(query);
    
    // 更新したコマンドを取得
    return await fetchCommand(id);
  } catch (error) {
    console.error(`Error updating command with id ${id}:`, error);
    throw error;
  }
};

// コマンドの削除
export const deleteCommand = async (id: number) => {
  try {
    // 書き込みモードを有効化
    await enableDatabaseWriteMode();
    
    const query = `
      BEGIN;
      DELETE FROM public.commands WHERE id = ${id};
      COMMIT;
    `;
    
    await executeSqlQuery(query);
    return true;
  } catch (error) {
    console.error(`Error deleting command with id ${id}:`, error);
    throw error;
  }
};

// テンプレート一覧の取得
export const fetchTemplates = async (category?: string) => {
  try {
    let query = 'SELECT * FROM public.templates';
    
    if (category) {
      query += ` WHERE category = '${category}'`;
    }
    
    query += ' ORDER BY created_at DESC;';
    
    const result = await executeSqlQuery(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
};

// テンプレート詳細の取得
export const fetchTemplate = async (id: number) => {
  try {
    const result = await executeSqlQuery(`SELECT * FROM public.templates WHERE id = ${id};`);
    
    if (result.rows.length === 0) {
      throw new Error(`Template with id ${id} not found`);
    }
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error fetching template with id ${id}:`, error);
    throw error;
  }
};

// テンプレートの作成
export const createTemplate = async (
  name: string,
  description: string,
  category: string,
  commandStructure: Record<string, any>,
  promptStructure?: Record<string, any>,
  apiIntegrationStructure?: Record<string, any>,
  isPublic: boolean = false,
  userId?: string
) => {
  try {
    // 書き込みモードを有効化
    await enableDatabaseWriteMode();
    
    const query = `
      BEGIN;
      INSERT INTO public.templates (
        name,
        description,
        category,
        command_structure,
        prompt_structure,
        api_integration_structure,
        is_public,
        user_id
      )
      VALUES (
        '${name}',
        '${description}',
        '${category}',
        '${JSON.stringify(commandStructure)}',
        ${promptStructure ? `'${JSON.stringify(promptStructure)}'` : 'NULL'},
        ${apiIntegrationStructure ? `'${JSON.stringify(apiIntegrationStructure)}'` : 'NULL'},
        ${isPublic},
        ${userId ? `'${userId}'` : 'NULL'}
      )
      RETURNING *;
      COMMIT;
    `;
    
    const result = await executeSqlQuery(query);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
};

// テンプレートの更新
export const updateTemplate = async (
  id: number,
  updates: {
    name?: string,
    description?: string,
    category?: string,
    commandStructure?: Record<string, any>,
    promptStructure?: Record<string, any> | null,
    apiIntegrationStructure?: Record<string, any> | null,
    isPublic?: boolean
  }
) => {
  try {
    // 書き込みモードを有効化
    await enableDatabaseWriteMode();
    
    // 更新するフィールドを構築
    const updateFields = [];
    
    if (updates.name !== undefined) {
      updateFields.push(`name = '${updates.name}'`);
    }
    
    if (updates.description !== undefined) {
      updateFields.push(`description = '${updates.description}'`);
    }
    
    if (updates.category !== undefined) {
      updateFields.push(`category = '${updates.category}'`);
    }
    
    if (updates.commandStructure !== undefined) {
      updateFields.push(`command_structure = '${JSON.stringify(updates.commandStructure)}'`);
    }
    
    if (updates.promptStructure !== undefined) {
      if (updates.promptStructure === null) {
        updateFields.push(`prompt_structure = NULL`);
      } else {
        updateFields.push(`prompt_structure = '${JSON.stringify(updates.promptStructure)}'`);
      }
    }
    
    if (updates.apiIntegrationStructure !== undefined) {
      if (updates.apiIntegrationStructure === null) {
        updateFields.push(`api_integration_structure = NULL`);
      } else {
        updateFields.push(`api_integration_structure = '${JSON.stringify(updates.apiIntegrationStructure)}'`);
      }
    }
    
    if (updates.isPublic !== undefined) {
      updateFields.push(`is_public = ${updates.isPublic}`);
    }
    
    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }
    
    const query = `
      BEGIN;
      UPDATE public.templates
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *;
      COMMIT;
    `;
    
    const result = await executeSqlQuery(query);
    return result.rows[0];
  } catch (error) {
    console.error(`Error updating template with id ${id}:`, error);
    throw error;
  }
};

// テンプレートの削除
export const deleteTemplate = async (id: number) => {
  try {
    // 書き込みモードを有効化
    await enableDatabaseWriteMode();
    
    const query = `
      BEGIN;
      DELETE FROM public.templates WHERE id = ${id};
      COMMIT;
    `;
    
    await executeSqlQuery(query);
    return true;
  } catch (error) {
    console.error(`Error deleting template with id ${id}:`, error);
    throw error;
  }
};

// コマンドログの作成
export const createCommandLog = async (
  commandId: number | null,
  botId: number | null,
  userId: string,
  guildId: string,
  channelId: string,
  input: Record<string, any>,
  status: 'success' | 'error' | 'pending' = 'pending'
) => {
  try {
    // 書き込みモードを有効化
    await enableDatabaseWriteMode();
    
    const query = `
      BEGIN;
      INSERT INTO public.command_logs (
        command_id,
        bot_id,
        user_id,
        guild_id,
        channel_id,
        input,
        status
      )
      VALUES (
        ${commandId ? commandId : 'NULL'},
        ${botId ? botId : 'NULL'},
        '${userId}',
        '${guildId}',
        '${channelId}',
        '${JSON.stringify(input)}',
        '${status}'
      )
      RETURNING *;
      COMMIT;
    `;
    
    const result = await executeSqlQuery(query);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating command log:', error);
    throw error;
  }
};

// コマンドログの更新
export const updateCommandLog = async (
  id: number,
  updates: {
    output?: string,
    status?: 'success' | 'error' | 'pending',
    executionTime?: number
  }
) => {
  try {
    // 書き込みモードを有効化
    await enableDatabaseWriteMode();
    
    // 更新するフィールドを構築
    const updateFields = [];
    
    if (updates.output !== undefined) {
      updateFields.push(`output = '${updates.output}'`);
    }
    
    if (updates.status !== undefined) {
      updateFields.push(`status = '${updates.status}'`);
    }
    
    if (updates.executionTime !== undefined) {
      updateFields.push(`execution_time = ${updates.executionTime}`);
    }
    
    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }
    
    const query = `
      BEGIN;
      UPDATE public.command_logs
      SET ${updateFields.join(', ')}
      WHERE id = ${id}
      RETURNING *;
      COMMIT;
    `;
    
    const result = await executeSqlQuery(query);
    return result.rows[0];
  } catch (error) {
    console.error(`Error updating command log with id ${id}:`, error);
    throw error;
  }
};

// コマンドログの取得
export const fetchCommandLogs = async (botId?: number, commandId?: number, limit: number = 50) => {
  try {
    let query = 'SELECT * FROM public.command_logs';
    const conditions = [];
    
    if (botId) {
      conditions.push(`bot_id = ${botId}`);
    }
    
    if (commandId) {
      conditions.push(`command_id = ${commandId}`);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT ${limit};`;
    
    const result = await executeSqlQuery(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching command logs:', error);
    throw error;
  }
};
