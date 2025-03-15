/**
 * コマンドテンプレートデータ
 * Created: 2025/3/14
 * Updated: 2025/3/15 - コマンドのアウトプット先設定を追加
 * 
 * このファイルは、事前定義されたコマンドテンプレートとカテゴリ情報を提供します。
 */

import { 
  CategoryInfo, 
  CommandTemplate, 
  TemplateCategory 
} from "@/types/template";

// カテゴリ情報
export const TEMPLATE_CATEGORIES: CategoryInfo[] = [
  {
    id: "information",
    name: "情報収集・分析",
    description: "過去ログ分析、リンク分析など",
    icon: "Search"
  },
  {
    id: "conversation",
    name: "対話・質問応答",
    description: "AIチャット、質問応答など",
    icon: "MessageSquare"
  },
  {
    id: "media",
    name: "メディア処理",
    description: "音声認識、画像生成など",
    icon: "Image"
  },
  {
    id: "utility",
    name: "ユーティリティ",
    description: "通知、リマインダー、投票など",
    icon: "Wrench"
  }
];

// テンプレートデータ
export const COMMAND_TEMPLATES: CommandTemplate[] = [
  // 情報収集・分析カテゴリ
  {
    id: "summarize-logs",
    name: "過去ログ要約",
    description: "チャンネルの過去ログを要約します",
    category: "information",
    difficulty: "beginner",
    tags: ["ai", "analysis", "summary"],
    popular: true,
    thumbnail: "/templates/summarize-logs.svg",
    defaultCommand: {
      name: "summarize",
      description: "チャンネルの過去ログを要約します",
      options: [
        {
          name: "period",
          description: "要約する期間",
          type: "string",
          required: true,
          choices: [
            { name: "今日", value: "today" },
            { name: "昨日", value: "yesterday" },
            { name: "先週", value: "week" },
            { name: "先月", value: "month" }
          ]
        },
        {
          name: "style",
          description: "要約スタイル",
          type: "string",
          required: false,
          choices: [
            { name: "簡潔", value: "brief" },
            { name: "詳細", value: "detailed" },
            { name: "ビジネス", value: "business" },
            { name: "カジュアル", value: "casual" }
          ]
        },
        {
          name: "format",
          description: "出力形式",
          type: "string",
          required: false,
          choices: [
            { name: "テキスト", value: "text" },
            { name: "埋め込み", value: "embed" },
            { name: "ファイル", value: "file" }
          ]
        }
      ],
      apiService: "openai",
      apiSettings: {
        model: "gpt-4",
        temperature: 0.7
      },
      outputDestination: { 
        type: "channels", 
        allowedChannels: [] 
      }, // 特定のチャンネルにのみ出力
      promptTemplate: `あなたはDiscordチャットの要約を行うアシスタントです。
以下のチャットログを{style}スタイルで要約してください。

# {channel_name}の要約 ({period})

## 主なトピック
{topics}

## 重要なポイント
{key_points}

## 共有されたリンク
{links}

要約生成: {timestamp}`
    },
    requiredPermissions: ["メッセージ履歴の閲覧", "メッセージの送信", "埋め込みリンクの送信"]
  },
  {
    id: "collect-links",
    name: "リンク収集",
    description: "特定期間内のリンクをまとめます",
    category: "information",
    difficulty: "beginner",
    tags: ["analysis", "summary"],
    popular: false,
    thumbnail: "/templates/collect-links.svg",
    defaultCommand: {
      name: "collect-links",
      description: "特定期間内のリンクをまとめます",
      options: [
        {
          name: "period",
          description: "収集する期間",
          type: "string",
          required: true,
          choices: [
            { name: "今日", value: "today" },
            { name: "昨日", value: "yesterday" },
            { name: "先週", value: "week" },
            { name: "先月", value: "month" }
          ]
        },
        {
          name: "keyword",
          description: "キーワード（任意）",
          type: "string",
          required: false
        }
      ],
      apiService: "openai",
      apiSettings: {
        model: "gpt-3.5-turbo",
        temperature: 0.5
      },
      outputDestination: { 
        type: "channels", 
        allowedChannels: [] 
      }, // 特定のチャンネルにのみ出力
      promptTemplate: `あなたはDiscordチャットからリンクを収集するアシスタントです。
以下のチャットログから共有されたリンクを抽出し、カテゴリ別に整理してください。
キーワード「{keyword}」に関連するリンクを優先してください。

# {channel_name}の共有リンク ({period})

{links_by_category}

収集日時: {timestamp}`
    },
    requiredPermissions: ["メッセージ履歴の閲覧", "メッセージの送信"]
  },
  {
    id: "find-topic",
    name: "トピック検索",
    description: "特定のトピックに関する過去の会話を検索",
    category: "information",
    difficulty: "intermediate",
    tags: ["analysis", "search"],
    popular: false,
    thumbnail: "/templates/find-topic.svg",
    defaultCommand: {
      name: "find-topic",
      description: "特定のトピックに関する過去の会話を検索",
      options: [
        {
          name: "topic",
          description: "検索するトピック",
          type: "string",
          required: true
        },
        {
          name: "period",
          description: "検索する期間",
          type: "string",
          required: false,
          choices: [
            { name: "すべて", value: "all" },
            { name: "今月", value: "month" },
            { name: "今年", value: "year" }
          ]
        }
      ],
      apiService: "openai",
      apiSettings: {
        model: "gpt-4",
        temperature: 0.3
      },
      outputDestination: { type: "global" } // グローバル（制限なし）
    },
    requiredPermissions: ["メッセージ履歴の閲覧", "メッセージの送信"]
  },

  // 対話・質問応答カテゴリ
  {
    id: "ai-chat",
    name: "AIチャット",
    description: "AIと自然な会話を行えるようにします",
    category: "conversation",
    difficulty: "beginner",
    tags: ["ai", "chat"],
    popular: true,
    thumbnail: "/templates/ai-chat.svg",
    defaultCommand: {
      name: "ask",
      description: "AIに質問します",
      options: [
        {
          name: "question",
          description: "質問内容",
          type: "string",
          required: true
        },
        {
          name: "persona",
          description: "AIのペルソナ",
          type: "string",
          required: false,
          choices: [
            { name: "フレンドリー", value: "friendly" },
            { name: "専門家", value: "expert" },
            { name: "クリエイティブ", value: "creative" },
            { name: "ビジネス", value: "business" }
          ]
        }
      ],
      apiService: "anthropic",
      apiSettings: {
        model: "claude-3-sonnet",
        temperature: 0.7
      },
      outputDestination: { type: "global" }, // グローバル（制限なし）
      promptTemplate: `あなたはDiscordボットのアシスタントです。
ユーザーからの質問に対して、丁寧かつ詳細に回答してください。
{persona}のペルソナで回答します。

質問: {question}

回答:`
    },
    requiredPermissions: ["メッセージの送信"]
  },
  {
    id: "chat-session",
    name: "チャットセッション",
    description: "AIとの継続的な会話セッションを開始",
    category: "conversation",
    difficulty: "intermediate",
    tags: ["ai", "chat"],
    popular: false,
    thumbnail: "/templates/chat-session.svg",
    defaultCommand: {
      name: "chat",
      description: "AIとの会話セッションを開始",
      options: [
        {
          name: "topic",
          description: "会話のトピック（任意）",
          type: "string",
          required: false
        },
        {
          name: "persona",
          description: "AIのペルソナ",
          type: "string",
          required: false,
          choices: [
            { name: "フレンドリー", value: "friendly" },
            { name: "専門家", value: "expert" },
            { name: "クリエイティブ", value: "creative" },
            { name: "ビジネス", value: "business" }
          ]
        }
      ],
      apiService: "anthropic",
      apiSettings: {
        model: "claude-3-opus",
        temperature: 0.8
      },
      outputDestination: { 
        type: "threads", 
        allowedThreads: [] 
      } // 特定のスレッドにのみ出力
    },
    requiredPermissions: ["メッセージの送信", "スレッドの作成"]
  },

  // メディア処理カテゴリ
  {
    id: "voice-recognition",
    name: "音声認識",
    description: "ボイスチャンネルでの会話を認識し、テキストに変換",
    category: "media",
    difficulty: "advanced",
    tags: ["voice"],
    popular: true,
    thumbnail: "/templates/voice-recognition.svg",
    defaultCommand: {
      name: "voice-join",
      description: "ボイスチャンネルに参加して音声認識を開始",
      options: [
        {
          name: "channel",
          description: "参加するボイスチャンネル",
          type: "channel",
          required: true
        },
        {
          name: "language",
          description: "認識する言語",
          type: "string",
          required: false,
          choices: [
            { name: "日本語", value: "ja" },
            { name: "英語", value: "en" },
            { name: "自動検出", value: "auto" }
          ]
        }
      ],
      apiService: "openai",
      apiSettings: {
        model: "whisper-1"
      },
      outputDestination: { 
        type: "servers", 
        allowedServers: [] 
      } // 特定のサーバーにのみ出力
    },
    requiredPermissions: ["ボイスチャンネルへの接続", "音声の受信", "メッセージの送信"]
  },
  {
    id: "image-generation",
    name: "画像生成",
    description: "AIによる画像生成",
    category: "media",
    difficulty: "beginner",
    tags: ["ai", "image"],
    popular: true,
    thumbnail: "/templates/image-generation.svg",
    defaultCommand: {
      name: "generate-image",
      description: "AIによる画像生成",
      options: [
        {
          name: "prompt",
          description: "画像の説明",
          type: "string",
          required: true
        },
        {
          name: "style",
          description: "画像のスタイル",
          type: "string",
          required: false,
          choices: [
            { name: "写真風", value: "photographic" },
            { name: "アニメ風", value: "anime" },
            { name: "デジタルアート", value: "digital-art" },
            { name: "絵画風", value: "painting" }
          ]
        },
        {
          name: "size",
          description: "画像サイズ",
          type: "string",
          required: false,
          choices: [
            { name: "正方形", value: "1024x1024" },
            { name: "横長", value: "1024x576" },
            { name: "縦長", value: "576x1024" }
          ]
        }
      ],
      apiService: "stability",
      apiSettings: {},
      outputDestination: { type: "global" } // グローバル（制限なし）
    },
    requiredPermissions: ["ファイルの添付", "メッセージの送信"]
  },

  // リンク分析カテゴリ
  {
    id: "analyze-link",
    name: "リンク分析",
    description: "リンク先の内容を分析・要約",
    category: "information",
    difficulty: "intermediate",
    tags: ["ai", "analysis", "summary"],
    popular: true,
    thumbnail: "/templates/analyze-link.svg",
    defaultCommand: {
      name: "analyze-link",
      description: "リンク先の内容を分析・要約",
      options: [
        {
          name: "url",
          description: "分析するURL",
          type: "string",
          required: true
        },
        {
          name: "format",
          description: "出力形式",
          type: "string",
          required: false,
          choices: [
            { name: "簡潔", value: "brief" },
            { name: "詳細", value: "detailed" },
            { name: "キーポイント", value: "key-points" }
          ]
        }
      ],
      apiService: "perplexity",
      apiSettings: {},
      outputDestination: { type: "global" }, // グローバル（制限なし）
      promptTemplate: `以下のURLの内容を{format}形式で要約してください：

URL: {url}

# 要約

{summary}

# キーポイント

{key_points}

# 関連情報

{related_info}

分析日時: {timestamp}`
    },
    requiredPermissions: ["メッセージの送信", "埋め込みリンクの送信"]
  },
  {
    id: "web-search",
    name: "ウェブ検索",
    description: "ウェブ検索を行い結果を要約",
    category: "information",
    difficulty: "beginner",
    tags: ["search", "summary"],
    popular: false,
    thumbnail: "/templates/web-search.svg",
    defaultCommand: {
      name: "search",
      description: "ウェブ検索を行い結果を要約",
      options: [
        {
          name: "query",
          description: "検索クエリ",
          type: "string",
          required: true
        },
        {
          name: "detail_level",
          description: "詳細レベル",
          type: "string",
          required: false,
          choices: [
            { name: "簡潔", value: "concise" },
            { name: "詳細", value: "detailed" }
          ]
        }
      ],
      apiService: "perplexity",
      apiSettings: {},
      outputDestination: { type: "global" }, // グローバル（制限なし）
      promptTemplate: `以下の検索クエリに関する情報を収集し、{detail_level}形式で要約してください。

検索クエリ: {query}

# 検索結果の要約

{summary}

# 主要な情報源

{sources}

検索実行: {timestamp}`
    },
    requiredPermissions: ["メッセージの送信"]
  }
];

// カテゴリ別のテンプレート取得
export const getTemplatesByCategory = (category: TemplateCategory): CommandTemplate[] => {
  return COMMAND_TEMPLATES.filter(template => template.category === category);
};

// 人気のテンプレート取得
export const getPopularTemplates = (): CommandTemplate[] => {
  return COMMAND_TEMPLATES.filter(template => template.popular);
};

// テンプレートIDによる取得
export const getTemplateById = (id: string): CommandTemplate | undefined => {
  return COMMAND_TEMPLATES.find(template => template.id === id);
};
