// デバッグ用のスクリプト
import { useEffect } from 'react';
import { useTemplatesMcp } from '@/hooks/useTemplatesMcp';
import { useToast } from '@/components/ui/use-toast';

export function TemplatesDebug() {
  const { 
    templates, 
    loading, 
    error,
    fetchTemplates
  } = useTemplatesMcp();
  
  const { toast } = useToast();
  
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        console.log('Fetching templates...');
        const result = await fetchTemplates();
        console.log('Templates result:', result);
        
        if (error) {
          console.error('Error fetching templates:', error);
          toast({
            title: 'エラー',
            description: 'テンプレートの取得に失敗しました: ' + error.message,
            type: 'error'
          });
        }
      } catch (err) {
        console.error('Exception fetching templates:', err);
        toast({
          title: 'エラー',
          description: 'テンプレートの取得中に例外が発生しました: ' + (err instanceof Error ? err.message : String(err)),
          type: 'error'
        });
      }
    };
    
    loadTemplates();
  }, [fetchTemplates, error, toast]);
  
  return null;
}
