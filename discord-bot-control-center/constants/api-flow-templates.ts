/**
 * API連携フローテンプレート
 * Created: 2025/3/15
 * Updated: 2025/3/15 - 各テンプレートの詳細設定を追加
 * 
 * このファイルは、複数のAPIサービスを連携させるフローのテンプレートを提供します。
 * 各テンプレートには、APIサービスの設定と連携フローが含まれています。
 */

import { ApiFlowStep } from "@/components/command/api-flow-builder";

// 音声認識＆要約テンプレート
export const VOICE_TRANSCRIPTION_SUMMARY_TEMPLATE: ApiFlowStep[] = [
  {
    id: "step-1",
    service: "openai",
    config: {
      service: "openai",
      settings: {
        openai: {
          model: "whisper-1",
          temperature: 0.0,
          language: "", // 自動検出
          prompt: "", // 認識精度向上のためのヒント（任意）
          responseFormat: "json"
        }
      }
    },
    name: "音声認識",
    description: "音声ファイルをテキストに変換します"
  },
  {
    id: "step-2",
    service: "openai",
    config: {
      service: "openai",
      settings: {
        openai: {
          model: "gpt-4",
          temperature: 0.7,
          maxTokens: 1000,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0,
          systemPrompt: "あなたは音声の書き起こしを要約するアシスタントです。以下の書き起こしテキストを簡潔に要約してください。重要なポイントを箇条書きでまとめ、話者の意図や感情も可能な限り捉えてください。"
        }
      }
    },
    name: "テキスト要約",
    description: "書き起こしテキストを要約します"
  }
];

// リンク分析＆図解化テンプレート
export const LINK_ANALYSIS_VISUALIZATION_TEMPLATE: ApiFlowStep[] = [
  {
    id: "step-1",
    service: "perplexity",
    config: {
      service: "perplexity",
      settings: {
        perplexity: {
          mode: "answer", // answer モードでURLの内容を分析
          detailLevel: "detailed", // 詳細な分析
          maxTokens: 2000, // 分析結果の最大長
          temperature: 0.5, // 生成の多様性
          focus: "comprehensive", // 包括的な分析
          language: "japanese" // 出力言語
        }
      }
    },
    name: "リンク分析",
    description: "リンク先の内容を分析・要約します"
  },
  {
    id: "step-2",
    service: "anthropic",
    config: {
      service: "anthropic",
      settings: {
        anthropic: {
          model: "claude-3-sonnet",
          temperature: 0.7,
          maxTokens: 1500,
          topP: 0.9,
          topK: 50,
          systemPrompt: "あなたは情報を図解化するエキスパートです。提供された情報を元に、マークダウン形式で図解を作成してください。図解には、主要な概念、関係性、プロセスを含めてください。Mermaid記法を使用して、フローチャート、シーケンス図、クラス図などを作成し、情報を視覚的に表現してください。また、重要なポイントを箇条書きでまとめ、図解の説明も加えてください。"
        }
      }
    },
    name: "図解化",
    description: "分析結果を図解化します"
  }
];

// 検索＆図解化テンプレート
export const SEARCH_VISUALIZATION_TEMPLATE: ApiFlowStep[] = [
  {
    id: "step-1",
    service: "perplexity",
    config: {
      service: "perplexity",
      settings: {
        perplexity: {
          mode: "search", // search モードで検索を実行
          detailLevel: "detailed", // 詳細な検索結果
          maxTokens: 2000, // 検索結果の最大長
          temperature: 0.5, // 生成の多様性
          focus: "comprehensive", // 包括的な検索
          language: "japanese", // 出力言語
          safeSearch: true // セーフサーチ有効
        }
      }
    },
    name: "ウェブ検索",
    description: "検索クエリに関する情報を収集します"
  },
  {
    id: "step-2",
    service: "anthropic",
    config: {
      service: "anthropic",
      settings: {
        anthropic: {
          model: "claude-3-sonnet",
          temperature: 0.7,
          maxTokens: 1500,
          topP: 0.9,
          topK: 50,
          systemPrompt: "あなたは情報を図解化するエキスパートです。提供された検索結果を元に、マークダウン形式で図解を作成してください。図解には、主要な概念、関係性、プロセスを含めてください。Mermaid記法を使用して、フローチャート、シーケンス図、クラス図などを作成し、情報を視覚的に表現してください。また、重要なポイントを箇条書きでまとめ、図解の説明も加えてください。複数の情報源からの情報を統合し、一貫性のある図解を作成してください。"
        }
      }
    },
    name: "図解化",
    description: "検索結果を図解化します"
  }
];

// YouTube動画分析テンプレート
export const YOUTUBE_ANALYSIS_TEMPLATE: ApiFlowStep[] = [
  {
    id: "step-1",
    service: "youtube",
    config: {
      service: "youtube",
      settings: {
        youtube: {
          type: "video", // 動画情報を取得
          order: "relevance", // 関連性順
          maxResults: 1, // 最大結果数
          captionLanguage: "", // 字幕言語（自動検出）
          region: "JP", // 地域設定
          includeTranscript: true, // 字幕を含める
          includeMetadata: true, // メタデータを含める
          includeComments: false // コメントは含めない
        }
      }
    },
    name: "YouTube動画取得",
    description: "YouTube動画の情報と字幕を取得します"
  },
  {
    id: "step-2",
    service: "openai",
    config: {
      service: "openai",
      settings: {
        openai: {
          model: "gpt-4",
          temperature: 0.5,
          maxTokens: 1000,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0,
          systemPrompt: "あなたはYouTube動画の内容を分析するアシスタントです。提供された字幕情報を元に、動画の内容を要約し、主要なポイントをリストアップしてください。以下の形式で分析結果を作成してください：\n\n# 動画分析\n\n## 基本情報\n- タイトル：[動画タイトル]\n- チャンネル：[チャンネル名]\n- 公開日：[公開日]\n- 長さ：[動画の長さ]\n\n## 要約\n[動画の内容を簡潔に要約]\n\n## 主要ポイント\n- [ポイント1]\n- [ポイント2]\n- [ポイント3]\n...\n\n## トピック\n[動画で扱われている主要なトピックを列挙]\n\n## 結論\n[動画の結論や主張]"
        }
      }
    },
    name: "動画内容分析",
    description: "動画の内容を分析・要約します"
  }
];

// 会議議事録作成テンプレート
export const MEETING_MINUTES_TEMPLATE: ApiFlowStep[] = [
  {
    id: "step-1",
    service: "openai",
    config: {
      service: "openai",
      settings: {
        openai: {
          model: "whisper-1",
          temperature: 0.0,
          language: "", // 自動検出
          prompt: "これは会議の録音です。参加者の名前、議題、決定事項に注意して書き起こしてください。", // 認識精度向上のためのヒント
          responseFormat: "json"
        }
      }
    },
    name: "音声認識",
    description: "会議の音声をテキストに変換します"
  },
  {
    id: "step-2",
    service: "anthropic",
    config: {
      service: "anthropic",
      settings: {
        anthropic: {
          model: "claude-3-opus",
          temperature: 0.3,
          maxTokens: 2000,
          topP: 0.95,
          topK: 40,
          systemPrompt: "あなたは会議の議事録を作成するプロフェッショナルです。提供された会議の書き起こしから、以下の形式で議事録を作成してください：\n\n# 会議議事録\n\n## 基本情報\n- 日時：[日時]\n- 参加者：[参加者リスト]\n\n## アジェンダ\n[主要なアジェンダ項目]\n\n## 議論内容\n[主要な議論ポイント]\n\n## 決定事項\n[会議で決定された事項]\n\n## アクションアイテム\n[フォローアップが必要な項目と担当者]\n\n## 次回会議\n[次回会議の予定（もし言及されていれば）]\n\n議事録は簡潔かつ明確に作成し、重要なポイントを漏らさないようにしてください。各発言者の意見を公平に反映させ、決定事項とアクションアイテムを明確に区別してください。"
        }
      }
    },
    name: "議事録作成",
    description: "書き起こしから議事録を作成します"
  }
];

// 多言語翻訳＆要約テンプレート
export const TRANSLATION_SUMMARY_TEMPLATE: ApiFlowStep[] = [
  {
    id: "step-1",
    service: "deepl",
    config: {
      service: "deepl",
      settings: {
        deepl: {
          targetLang: "JA", // 日本語に翻訳
          formality: "default", // 標準的な丁寧さ
          glossary: "", // 用語集（任意）
          tagHandling: "ignore", // HTMLタグの処理
          preserveFormatting: true, // 書式を保持
          outlineDetection: true // アウトライン検出
        }
      }
    },
    name: "翻訳",
    description: "テキストを日本語に翻訳します"
  },
  {
    id: "step-2",
    service: "openai",
    config: {
      service: "openai",
      settings: {
        openai: {
          model: "gpt-3.5-turbo",
          temperature: 0.5,
          maxTokens: 800,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0,
          systemPrompt: "あなたは翻訳されたテキストを要約するアシスタントです。提供されたテキストを簡潔に要約し、主要なポイントをリストアップしてください。以下の形式で要約を作成してください：\n\n# 要約\n\n[テキストの内容を簡潔に要約]\n\n## 主要ポイント\n- [ポイント1]\n- [ポイント2]\n- [ポイント3]\n...\n\n## キーワード\n[テキストの主要なキーワードを列挙]\n\n要約は原文の意図を正確に反映し、重要な情報を漏らさないようにしてください。専門用語や固有名詞は正確に保持してください。"
        }
      }
    },
    name: "要約",
    description: "翻訳されたテキストを要約します"
  }
];

// 画像生成＆説明テンプレート
export const IMAGE_GENERATION_DESCRIPTION_TEMPLATE: ApiFlowStep[] = [
  {
    id: "step-1",
    service: "stability",
    config: {
      service: "stability",
      settings: {
        stability: {
          model: "stable-diffusion-xl", // 使用モデル
          steps: 30, // 生成ステップ数
          cfgScale: 7, // プロンプトへの忠実度
          width: 1024, // 画像幅
          height: 1024, // 画像高さ
          sampler: "K_EULER_ANCESTRAL", // サンプリング方法
          seed: -1, // ランダムシード
          stylePreset: "photographic", // スタイルプリセット
          clipGuidancePreset: "FAST_BLUE", // CLIPガイダンス
          diffusion: "normal" // 拡散プロセス
        }
      }
    },
    name: "画像生成",
    description: "プロンプトから画像を生成します"
  },
  {
    id: "step-2",
    service: "anthropic",
    config: {
      service: "anthropic",
      settings: {
        anthropic: {
          model: "claude-3-haiku",
          temperature: 0.7,
          maxTokens: 500,
          topP: 0.9,
          topK: 50,
          systemPrompt: "あなたは生成された画像を説明するアシスタントです。画像の内容、スタイル、雰囲気などを詳細に説明してください。以下の観点から画像を分析してください：\n\n1. 画像の主題と全体的な構図\n2. 色彩とトーン\n3. 光と影の使い方\n4. テクスチャと細部\n5. 画像から感じられる雰囲気や感情\n6. アート様式や参照されているスタイル\n\n説明は具体的かつ描写的にし、画像を見ていない人でも視覚化できるようにしてください。専門的な美術用語も適切に使用してください。"
        }
      }
    },
    name: "画像説明",
    description: "生成された画像の説明を作成します"
  }
];

// 全テンプレートをエクスポート
export const API_FLOW_TEMPLATES = {
  VOICE_TRANSCRIPTION_SUMMARY_TEMPLATE,
  LINK_ANALYSIS_VISUALIZATION_TEMPLATE,
  SEARCH_VISUALIZATION_TEMPLATE,
  YOUTUBE_ANALYSIS_TEMPLATE,
  MEETING_MINUTES_TEMPLATE,
  TRANSLATION_SUMMARY_TEMPLATE,
  IMAGE_GENERATION_DESCRIPTION_TEMPLATE
};
