/**
 * テンプレートデータをデータベースに挿入するスクリプト
 * 
 * 使用方法:
 * 1. .env.localファイルにSupabaseの接続情報を設定
 * 2. node scripts/seed-templates.js を実行
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase接続情報
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('環境変数が設定されていません。.env.localファイルを確認してください。');
  process.exit(1);
}

// サービスロールキーを使用してSupabaseクライアントを作成
// これによりRLSをバイパスできます
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// デフォルトのテンプレートデータ
const defaultTemplates = [
  {
    name: '基本的な挨拶コマンド',
    description: 'ユーザーに挨拶するシンプルなコマンド',
    category: 'basic',
    command_structure: {
      name: 'hello',
      description: 'ボットからの挨拶を受け取る',
      options: [],
      difficulty: 'beginner',
      tags: ['基本', '挨拶', '初心者向け'],
      popular: true
    },
    prompt_structure: {
      content: 'ユーザーに元気よく挨拶してください。時間帯に応じて挨拶を変えると良いでしょう。',
      variables: []
    },
    api_integration_structure: {
      service: 'openai',
      settings: {
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 100
      }
    },
    is_public: true
  },
  {
    name: '天気予報コマンド',
    description: '指定した都市の天気予報を取得するコマンド',
    category: 'utility',
    command_structure: {
      name: 'weather',
      description: '指定した都市の天気予報を取得',
      options: [
        {
          name: 'city',
          description: '都市名',
          type: 'string',
          required: true
        },
        {
          name: 'days',
          description: '予報日数（1-5）',
          type: 'integer',
          required: false
        }
      ],
      difficulty: 'intermediate',
      tags: ['ユーティリティ', '天気', 'API連携'],
      popular: true
    },
    prompt_structure: {
      content: '{{city}}の天気予報を{{days}}日分、わかりやすく説明してください。',
      variables: ['city', 'days']
    },
    api_integration_structure: {
      service: 'openweather',
      settings: {
        units: 'metric'
      },
      flow: [
        {
          type: 'api_call',
          service: 'openweather',
          endpoint: '/forecast',
          params: {
            q: '{{city}}',
            cnt: '{{days}}'
          }
        },
        {
          type: 'llm_process',
          service: 'openai',
          model: 'gpt-3.5-turbo',
          prompt: '以下の天気データを元に、{{city}}の{{days}}日間の天気予報を日本語で簡潔にまとめてください。\n\n{{api_response}}'
        }
      ]
    },
    is_public: true
  },
  {
    name: '画像生成コマンド',
    description: 'テキストプロンプトから画像を生成するコマンド',
    category: 'creative',
    command_structure: {
      name: 'imagine',
      description: 'テキストプロンプトから画像を生成',
      options: [
        {
          name: 'prompt',
          description: '画像生成のプロンプト',
          type: 'string',
          required: true
        },
        {
          name: 'style',
          description: '画像のスタイル',
          type: 'string',
          required: false,
          choices: [
            { name: '写真風', value: 'photo' },
            { name: 'アニメ風', value: 'anime' },
            { name: '油絵風', value: 'oil-painting' }
          ]
        }
      ],
      difficulty: 'intermediate',
      tags: ['創作', '画像生成', 'AI'],
      popular: true
    },
    prompt_structure: {
      content: '',
      variables: ['prompt', 'style']
    },
    api_integration_structure: {
      service: 'stability',
      settings: {
        engine: 'stable-diffusion-xl-1024-v1-0',
        cfg_scale: 7,
        steps: 30
      },
      flow: [
        {
          type: 'api_call',
          service: 'stability',
          endpoint: '/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
          params: {
            prompt: '{{prompt}}',
            style: '{{style}}'
          }
        }
      ]
    },
    is_public: true
  },
  {
    name: '翻訳コマンド',
    description: 'テキストを別の言語に翻訳するコマンド',
    category: 'utility',
    command_structure: {
      name: 'translate',
      description: 'テキストを別の言語に翻訳',
      options: [
        {
          name: 'text',
          description: '翻訳するテキスト',
          type: 'string',
          required: true
        },
        {
          name: 'target',
          description: '翻訳先の言語',
          type: 'string',
          required: true,
          choices: [
            { name: '英語', value: 'en' },
            { name: '日本語', value: 'ja' },
            { name: '中国語', value: 'zh' },
            { name: 'フランス語', value: 'fr' },
            { name: 'ドイツ語', value: 'de' },
            { name: 'スペイン語', value: 'es' }
          ]
        }
      ],
      difficulty: 'beginner',
      tags: ['ユーティリティ', '翻訳', '言語'],
      popular: true
    },
    prompt_structure: {
      content: '',
      variables: ['text', 'target']
    },
    api_integration_structure: {
      service: 'deepl',
      settings: {},
      flow: [
        {
          type: 'api_call',
          service: 'deepl',
          endpoint: '/translate',
          params: {
            text: '{{text}}',
            target_lang: '{{target}}'
          }
        }
      ]
    },
    is_public: true
  },
  {
    name: '音楽検索コマンド',
    description: '曲名やアーティスト名から音楽を検索するコマンド',
    category: 'entertainment',
    command_structure: {
      name: 'music',
      description: '音楽を検索',
      options: [
        {
          name: 'query',
          description: '検索キーワード（曲名、アーティスト名など）',
          type: 'string',
          required: true
        },
        {
          name: 'limit',
          description: '検索結果の最大数',
          type: 'integer',
          required: false
        }
      ],
      difficulty: 'intermediate',
      tags: ['エンターテイメント', '音楽', '検索'],
      popular: true
    },
    prompt_structure: {
      content: '',
      variables: ['query', 'limit']
    },
    api_integration_structure: {
      service: 'spotify',
      settings: {},
      flow: [
        {
          type: 'api_call',
          service: 'spotify',
          endpoint: '/search',
          params: {
            q: '{{query}}',
            type: 'track',
            limit: '{{limit}}'
          }
        },
        {
          type: 'format_response',
          template: '検索結果:\n{{#tracks}}\n- {{name}} by {{artists}} ({{album}})\n{{/tracks}}'
        }
      ]
    },
    is_public: true
  }
];

/**
 * テンプレートをデータベースに挿入
 */
async function seedTemplates() {
  console.log('テンプレートデータをデータベースに挿入中...');
  
  for (const template of defaultTemplates) {
    try {
      // サービスロールキーを使用してテンプレートを挿入
      // これによりRLSをバイパスできます
      const { data, error } = await supabase
        .from('templates')
        .insert({
          name: template.name,
          description: template.description,
          category: template.category,
          command_structure: template.command_structure,
          prompt_structure: template.prompt_structure,
          api_integration_structure: template.api_integration_structure,
          is_public: template.is_public
        });
      
      if (error) {
        throw error;
      }
      
      console.log(`テンプレート「${template.name}」を挿入しました`);
    } catch (error) {
      console.error(`テンプレート「${template.name}」の挿入に失敗:`, error);
    }
  }
  
  console.log('テンプレートデータの挿入が完了しました');
}

// スクリプトの実行
seedTemplates()
  .catch(err => {
    console.error('エラーが発生しました:', err);
    process.exit(1);
  });
