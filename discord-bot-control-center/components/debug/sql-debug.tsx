// SQLクエリを実行するスクリプト
import { useEffect } from 'react';
import { useSupabaseMcp } from '@/hooks/useSupabaseMcp';
import { useToast } from '@/components/ui/use-toast';

export function SqlDebug() {
  const { executeQuery, enableWriteMode } = useSupabaseMcp();
  const { toast } = useToast();
  
  useEffect(() => {
    const runQueries = async () => {
      try {
        console.log('Enabling write mode...');
        await enableWriteMode();
        
        console.log('Checking if templates table exists...');
        const tablesResult = await executeQuery('SELECT * FROM information_schema.tables WHERE table_schema = \'public\' AND table_name = \'templates\';');
        console.log('Tables result:', tablesResult);
        
        if (tablesResult && tablesResult.rows && tablesResult.rows.length === 0) {
          console.log('Templates table does not exist, creating it...');
          
          const createTableResult = await executeQuery(`
            BEGIN;
            CREATE TABLE IF NOT EXISTS public.templates (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              description TEXT,
              category VARCHAR(50) NOT NULL,
              command_structure JSONB NOT NULL,
              prompt_structure JSONB,
              api_integration_structure JSONB,
              is_public BOOLEAN DEFAULT false,
              user_id UUID,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            COMMIT;
          `);
          
          console.log('Create table result:', createTableResult);
          
          // サンプルテンプレートを作成
          console.log('Creating sample template...');
          const createSampleResult = await executeQuery(`
            BEGIN;
            INSERT INTO public.templates (
              name, 
              description, 
              category, 
              command_structure, 
              prompt_structure, 
              api_integration_structure, 
              is_public
            ) VALUES (
              'サンプルテンプレート',
              'これはサンプルテンプレートです。',
              'information',
              '{"name": "sample", "description": "サンプルコマンド", "options": [], "difficulty": "beginner", "tags": ["サンプル", "テスト"], "popular": false}',
              '{"content": "これはサンプルプロンプトです。", "variables": []}',
              '{"service": "openai", "settings": {"model": "gpt-4"}}',
              true
            );
            COMMIT;
          `);
          
          console.log('Create sample result:', createSampleResult);
        } else {
          console.log('Templates table exists, checking contents...');
          const templatesResult = await executeQuery('SELECT * FROM public.templates;');
          console.log('Templates content:', templatesResult);
          
          if (templatesResult && templatesResult.rows && templatesResult.rows.length === 0) {
            console.log('Templates table is empty, creating sample template...');
            
            const createSampleResult = await executeQuery(`
              BEGIN;
              INSERT INTO public.templates (
                name, 
                description, 
                category, 
                command_structure, 
                prompt_structure, 
                api_integration_structure, 
                is_public
              ) VALUES (
                'サンプルテンプレート',
                'これはサンプルテンプレートです。',
                'information',
                '{"name": "sample", "description": "サンプルコマンド", "options": [], "difficulty": "beginner", "tags": ["サンプル", "テスト"], "popular": false}',
                '{"content": "これはサンプルプロンプトです。", "variables": []}',
                '{"service": "openai", "settings": {"model": "gpt-4"}}',
                true
              );
              COMMIT;
            `);
            
            console.log('Create sample result:', createSampleResult);
          }
        }
      } catch (err) {
        console.error('Error executing SQL queries:', err);
        toast({
          title: 'エラー',
          description: 'SQLクエリの実行に失敗しました: ' + (err instanceof Error ? err.message : String(err)),
          type: 'error'
        });
      }
    };
    
    runQueries();
  }, [executeQuery, enableWriteMode, toast]);
  
  return null;
}
