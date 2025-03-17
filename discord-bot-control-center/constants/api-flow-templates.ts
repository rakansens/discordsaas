/**
 * API連携フローテンプレート
 * Created: 2025/3/15
 * Updated: 2025/3/15 - 各テンプレートの詳細設定を追加
 * Updated: 2025/3/16 - 新しいAPI連携フローテンプレートを追加（ナレッジベース、ノートテイキング、スケジュール、ロール管理、ニュース分析）
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

// 過去ログ分析アシスタントテンプレート
export const LOG_ANALYSIS_ASSISTANT_TEMPLATE: ApiFlowStep[] = [
  {
    id: "step-1",
    service: "openai",
    config: {
      service: "openai",
      settings: {
        openai: {
          model: "gpt-4",
          temperature: 0.3,
          maxTokens: 1500,
          topP: 1,
          frequencyPenalty: 0.2,
          presencePenalty: 0.1,
          systemPrompt: "あなたはDiscordサーバーの過去ログを分析するエキスパートです。提供されたログデータから、以下の情報を抽出・分析してください：\n\n1. 主要な議論トピック\n2. 重要な決定事項\n3. 未解決の問題や質問\n4. メンバー間のやり取りのパターン\n5. 頻出キーワードや話題\n\n分析結果は以下の形式で提供してください：\n\n# ログ分析レポート\n\n## 分析期間\n[分析対象期間]\n\n## 主要トピック\n[トピック1]: [簡潔な説明]\n[トピック2]: [簡潔な説明]\n...\n\n## 重要な決定事項\n- [決定事項1]\n- [決定事項2]\n...\n\n## 未解決の問題\n- [問題1]\n- [問題2]\n...\n\n## コミュニケーションパターン\n[観察されたパターンの説明]\n\n## キーワード分析\n[頻出キーワードとその文脈]\n\n## 推奨アクション\n[推奨される次のステップ]"
        }
      }
    },
    name: "ログ分析",
    description: "過去ログを分析します"
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
          maxTokens: 1000,
          topP: 0.9,
          topK: 50,
          systemPrompt: "あなたは分析結果を視覚化するエキスパートです。提供された過去ログの分析結果を元に、以下の視覚的な要素を作成してください：\n\n1. トピックの関連性を示すマインドマップ（Mermaid記法）\n2. 時系列で重要なイベントを示すタイムライン（Mermaid記法）\n3. キーワードの出現頻度を示す表\n4. メンバー間のやり取りを示すネットワーク図（可能であれば）\n\nこれらの視覚的要素は、分析結果を補完し、より理解しやすくするためのものです。Mermaid記法を使用して、マークダウン形式で提供してください。"
        }
      }
    },
    name: "視覚化",
    description: "分析結果を視覚化します"
  }
];

// AI対話アシスタントテンプレート
export const AI_CONVERSATION_ASSISTANT_TEMPLATE: ApiFlowStep[] = [
  {
    id: "step-1",
    service: "anthropic",
    config: {
      service: "anthropic",
      settings: {
        anthropic: {
          model: "claude-3-opus",
          temperature: 0.7,
          maxTokens: 1500,
          topP: 0.9,
          topK: 50,
          systemPrompt: "あなたはDiscordサーバー内で対話するAIアシスタントです。ユーザーからの質問や会話に対して、以下のガイドラインに従って応答してください：\n\n1. 親しみやすく、自然な会話スタイルを維持する\n2. 質問に対して正確かつ包括的な情報を提供する\n3. 複雑な概念を簡潔に説明する\n4. 必要に応じて例を提供する\n5. ユーザーの感情や意図を理解し、共感を示す\n6. 適切な場合はユーモアを交える\n7. 会話の文脈を維持し、以前の発言を参照する\n8. 不明な点がある場合は、明確化を求める\n\nあなたの目標は、有益で魅力的な会話体験を提供し、ユーザーが必要とする情報や支援を得られるようにすることです。"
        }
      }
    },
    name: "対話処理",
    description: "ユーザーの質問や会話を処理します"
  },
  {
    id: "step-2",
    service: "perplexity",
    config: {
      service: "perplexity",
      settings: {
        perplexity: {
          mode: "search", // 必要に応じて検索モードを使用
          detailLevel: "concise", // 簡潔な検索結果
          maxTokens: 1000, // 検索結果の最大長
          temperature: 0.3, // 低い温度で正確な情報を提供
          focus: "factual", // 事実に焦点を当てる
          language: "japanese", // 出力言語
          safeSearch: true // セーフサーチ有効
        }
      }
    },
    name: "情報検索",
    description: "必要に応じて最新情報を検索します"
  }
];

// リンク検索・要約アシスタントテンプレート
export const LINK_SEARCH_SUMMARY_ASSISTANT_TEMPLATE: ApiFlowStep[] = [
  {
    id: "step-1",
    service: "perplexity",
    config: {
      service: "perplexity",
      settings: {
        perplexity: {
          mode: "search", // 検索モードを使用
          detailLevel: "detailed", // 詳細な検索結果
          maxTokens: 1500, // 検索結果の最大長
          temperature: 0.3, // 低い温度で正確な情報を提供
          focus: "comprehensive", // 包括的な検索
          language: "japanese", // 出力言語
          safeSearch: true // セーフサーチ有効
        }
      }
    },
    name: "リンク検索",
    description: "トピックに関連するリンクを検索します"
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
          systemPrompt: "あなたは検索結果とリンクを要約するエキスパートです。提供された検索結果とリンク情報を元に、以下の形式で要約を作成してください：\n\n# 検索結果要約\n\n## トピック概要\n[検索トピックの簡潔な概要]\n\n## 主要な情報源\n1. [リンク1]: [簡潔な説明]\n2. [リンク2]: [簡潔な説明]\n...\n\n## 重要ポイント\n- [ポイント1]\n- [ポイント2]\n...\n\n## 異なる見解\n[トピックに関する異なる見解や意見の要約]\n\n## 推奨リンク\n[最も関連性の高いリンクとその理由]\n\n要約は客観的で、バランスの取れた情報を提供するようにしてください。各リンクの信頼性も考慮し、情報の質に関するコメントも含めてください。"
        }
      }
    },
    name: "リンク要約",
    description: "検索結果とリンクを要約します"
  }
];

// 音声認識アシスタントテンプレート
export const VOICE_RECOGNITION_ASSISTANT_TEMPLATE: ApiFlowStep[] = [
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
          prompt: "これは会話の録音です。話者の区別、トピックの変化、質問に注意して書き起こしてください。", // 認識精度向上のためのヒント
          responseFormat: "json"
        }
      }
    },
    name: "音声認識",
    description: "音声をテキストに変換します"
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
          systemPrompt: "あなたは音声認識結果を処理するアシスタントです。提供された書き起こしテキストを分析し、以下の形式で応答を作成してください：\n\n# 音声認識結果\n\n## 書き起こし\n[整形された書き起こしテキスト]\n\n## 検出された質問\n[書き起こしから検出された質問のリスト]\n\n## 回答\n[検出された質問への回答]\n\n## 追加情報\n[関連する追加情報や提案]\n\n書き起こしテキストから質問や指示を正確に抽出し、それに対して適切に応答してください。質問が明確でない場合は、最も可能性の高い解釈に基づいて応答してください。"
        }
      }
    },
    name: "質問応答",
    description: "認識されたテキストから質問を抽出し回答します"
  }
];

// パーソナルナレッジベースアシスタントテンプレート
export const PERSONAL_KNOWLEDGE_BASE_TEMPLATE: ApiFlowStep[] = [
  {
    id: "step-1",
    service: "openai",
    config: {
      service: "openai",
      settings: {
        openai: {
          model: "gpt-4",
          temperature: 0.3,
          maxTokens: 1500,
          topP: 1,
          frequencyPenalty: 0.2,
          presencePenalty: 0.1,
          systemPrompt: "あなたはDiscordサーバー内の知識を整理・管理するエキスパートです。提供されたメッセージやコンテンツから、重要な情報を抽出し、構造化された知識ベースを構築してください。以下のガイドラインに従ってください：\n\n1. 重要な情報、定義、手順、リソースなどを特定する\n2. 情報をカテゴリ別に整理する\n3. 関連する情報同士をリンクさせる\n4. 情報の出典や日付を記録する\n5. 情報の信頼性や重要度を評価する\n\n抽出した知識は、検索可能で再利用しやすい形式で整理してください。"
        }
      }
    },
    name: "知識抽出",
    description: "メッセージから重要な知識を抽出します"
  },
  {
    id: "step-2",
    service: "perplexity",
    config: {
      service: "perplexity",
      settings: {
        perplexity: {
          mode: "search",
          detailLevel: "detailed",
          maxTokens: 1000,
          temperature: 0.3,
          focus: "factual",
          language: "japanese",
          safeSearch: true
        }
      }
    },
    name: "情報補完",
    description: "抽出した知識を外部情報で補完します"
  }
];

// ニュース・トレンド分析アシスタントテンプレート
export const NEWS_TREND_ANALYSIS_TEMPLATE: ApiFlowStep[] = [
  {
    id: "step-1",
    service: "perplexity",
    config: {
      service: "perplexity",
      settings: {
        perplexity: {
          mode: "search",
          detailLevel: "detailed",
          maxTokens: 2000,
          temperature: 0.3,
          focus: "comprehensive",
          language: "japanese",
          safeSearch: true
        }
      }
    },
    name: "ニュース検索",
    description: "特定トピックの最新ニュースを検索します"
  },
  {
    id: "step-2",
    service: "openai",
    config: {
      service: "openai",
      settings: {
        openai: {
          model: "gpt-4",
          temperature: 0.4,
          maxTokens: 1500,
          topP: 1,
          frequencyPenalty: 0.1,
          presencePenalty: 0.1,
          systemPrompt: "あなたはニュースとトレンドを分析するエキスパートです。提供された検索結果から、以下の形式で分析レポートを作成してください：\n\n# ニュース分析レポート\n\n## トピック概要\n[トピックの簡潔な概要と背景]\n\n## 主要ニュース\n1. [ニュース1]: [簡潔な説明と重要性]\n2. [ニュース2]: [簡潔な説明と重要性]\n...\n\n## トレンド分析\n[現在のトレンドと将来の展望]\n\n## 異なる見解\n[トピックに関する異なる見解や意見の要約]\n\n## 専門家の意見\n[関連する専門家の見解や分析]\n\n分析は客観的で、バランスの取れた情報を提供するようにしてください。情報源の信頼性も考慮し、情報の質に関するコメントも含めてください。"
        }
      }
    },
    name: "トレンド分析",
    description: "ニュース情報からトレンドを分析します"
  },
  {
    id: "step-3",
    service: "anthropic",
    config: {
      service: "anthropic",
      settings: {
        anthropic: {
          model: "claude-3-sonnet",
          temperature: 0.7,
          maxTokens: 1000,
          topP: 0.9,
          topK: 50,
          systemPrompt: "あなたは分析結果を視覚化するエキスパートです。提供されたニュース分析結果を元に、以下の視覚的な要素を作成してください：\n\n1. トピックの関連性を示すマインドマップ（Mermaid記法）\n2. 時系列でトレンドの変化を示すタイムライン（Mermaid記法）\n3. 異なる見解の関係を示す比較表\n4. 将来予測の可能性を示す分岐図（可能であれば）\n\nこれらの視覚的要素は、分析結果を補完し、より理解しやすくするためのものです。Mermaid記法を使用して、マークダウン形式で提供してください。"
        }
      }
    },
    name: "インサイト視覚化",
    description: "分析結果を視覚的に表現します"
  }
];

// スマートノートテイキングアシスタントテンプレート
export const SMART_NOTE_TAKING_TEMPLATE: ApiFlowStep[] = [
  {
    id: "step-1",
    service: "openai",
    config: {
      service: "openai",
      settings: {
        openai: {
          model: "gpt-4",
          temperature: 0.3,
          maxTokens: 1500,
          topP: 1,
          frequencyPenalty: 0.2,
          presencePenalty: 0.1,
          systemPrompt: "あなたは会話から重要情報を抽出し、構造化されたノートを作成するエキスパートです。提供された会話やテキストから、以下の情報を抽出・整理してください：\n\n1. 主要なトピックと議論ポイント\n2. 重要な事実や情報\n3. 決定事項や合意点\n4. アクションアイテムと担当者\n5. 締め切りや重要な日付\n6. 未解決の質問や課題\n\n抽出した情報は、検索可能で再利用しやすい構造化された形式で整理してください。"
        }
      }
    },
    name: "情報抽出",
    description: "会話から重要情報を抽出します"
  },
  {
    id: "step-2",
    service: "anthropic",
    config: {
      service: "anthropic",
      settings: {
        anthropic: {
          model: "claude-3-sonnet",
          temperature: 0.5,
          maxTokens: 1200,
          topP: 0.9,
          topK: 50,
          systemPrompt: "あなたは抽出された情報を構造化するエキスパートです。提供された情報を元に、以下の形式で構造化されたノートを作成してください：\n\n# 会話ノート\n\n## 基本情報\n- 日時：[日時]\n- 参加者：[参加者リスト]\n- コンテキスト：[会話の背景や目的]\n\n## トピック別サマリー\n### [トピック1]\n- [重要ポイント]\n- [関連情報]\n\n### [トピック2]\n- [重要ポイント]\n- [関連情報]\n\n## アクションアイテム\n- [ ] [アクション1] - 担当: [名前], 期限: [日付]\n- [ ] [アクション2] - 担当: [名前], 期限: [日付]\n\n## フォローアップ質問\n- [質問1]\n- [質問2]\n\n## 関連リソース\n- [リソース1]: [説明]\n- [リソース2]: [説明]\n\nノートは簡潔かつ明確に作成し、重要なポイントを漏らさないようにしてください。情報は論理的に整理し、後で参照しやすい構造にしてください。"
        }
      }
    },
    name: "ノート構造化",
    description: "抽出した情報を構造化されたノートに整理します"
  }
];

// スケジュール最適化アシスタントテンプレート
export const SCHEDULE_OPTIMIZATION_TEMPLATE: ApiFlowStep[] = [
  {
    id: "step-1",
    service: "openai",
    config: {
      service: "openai",
      settings: {
        openai: {
          model: "gpt-4",
          temperature: 0.3,
          maxTokens: 1500,
          topP: 1,
          frequencyPenalty: 0.1,
          presencePenalty: 0.1,
          systemPrompt: "あなたはチームのスケジュール最適化を支援するエキスパートです。提供されたスケジュール情報、タスク、優先順位などから、最適なスケジュール案を作成してください。以下の要素を考慮してください：\n\n1. 各メンバーの空き時間と優先事項\n2. タスクの依存関係と締め切り\n3. 会議や協業作業の最適な時間帯\n4. タスクの優先順位と重要度\n5. 作業の集中時間の確保\n\n最適化されたスケジュールは、チームの生産性を最大化し、ストレスを最小化することを目指してください。"
        }
      }
    },
    name: "スケジュール分析",
    description: "スケジュールとタスク情報を分析します"
  },
  {
    id: "step-2",
    service: "anthropic",
    config: {
      service: "anthropic",
      settings: {
        anthropic: {
          model: "claude-3-sonnet",
          temperature: 0.4,
          maxTokens: 1200,
          topP: 0.9,
          topK: 50,
          systemPrompt: "あなたはスケジュール最適化の専門家です。分析結果を元に、以下の形式で最適化されたスケジュール提案を作成してください：\n\n# スケジュール最適化提案\n\n## 概要\n[全体的な最適化アプローチの説明]\n\n## 推奨スケジュール\n### [日付/週]\n- [時間帯]: [活動/タスク] - [担当者]\n- [時間帯]: [活動/タスク] - [担当者]\n...\n\n## タスク優先順位\n1. [最優先タスク]: [理由と期限]\n2. [次の優先タスク]: [理由と期限]\n...\n\n## 時間管理のアドバイス\n- [アドバイス1]\n- [アドバイス2]\n...\n\n## 潜在的な課題と対策\n- [課題1]: [対策]\n- [課題2]: [対策]\n...\n\n提案は具体的かつ実行可能なものにし、チームの状況や制約を考慮してください。視覚的な要素（タイムラインやカレンダービューなど）も含めると理解しやすくなります。"
        }
      }
    },
    name: "スケジュール最適化",
    description: "最適なスケジュール案を作成します"
  }
];

// ロールマネジメントアシスタントテンプレート
export const ROLE_MANAGEMENT_TEMPLATE: ApiFlowStep[] = [
  {
    id: "step-1",
    service: "openai",
    config: {
      service: "openai",
      settings: {
        openai: {
          model: "gpt-4",
          temperature: 0.3,
          maxTokens: 1500,
          topP: 1,
          frequencyPenalty: 0.1,
          presencePenalty: 0.1,
          systemPrompt: "あなたはDiscordサーバーのロール管理を最適化するエキスパートです。提供されたサーバー情報、メンバーの活動パターン、現在のロール構造などから、最適なロール設計と管理方法を提案してください。以下の要素を考慮してください：\n\n1. メンバーの活動頻度と参加パターン\n2. メンバーの貢献度と専門性\n3. サーバーの目的と構造\n4. 必要な権限レベルと管理階層\n5. 自動ロール付与の条件と方法\n\n提案するロール構造は、サーバーの運営を効率化し、コミュニティの健全な成長を促進することを目指してください。"
        }
      }
    },
    name: "ロール分析",
    description: "サーバーとメンバー情報を分析します"
  },
  {
    id: "step-2",
    service: "anthropic",
    config: {
      service: "anthropic",
      settings: {
        anthropic: {
          model: "claude-3-sonnet",
          temperature: 0.4,
          maxTokens: 1200,
          topP: 0.9,
          topK: 50,
          systemPrompt: "あなたはDiscordサーバーのロール設計と管理の専門家です。分析結果を元に、以下の形式で最適化されたロール管理提案を作成してください：\n\n# ロール管理最適化提案\n\n## 現状分析\n[現在のロール構造の分析と課題]\n\n## 推奨ロール構造\n### 管理ロール\n- [ロール名]: [権限と責任]\n- [ロール名]: [権限と責任]\n\n### 一般メンバーロール\n- [ロール名]: [条件と特典]\n- [ロール名]: [条件と特典]\n\n### 特殊ロール\n- [ロール名]: [目的と付与条件]\n- [ロール名]: [目的と付与条件]\n\n## 自動ロール付与ルール\n- [ルール1]: [条件と付与するロール]\n- [ルール2]: [条件と付与するロール]\n\n## ロール階層と権限設計\n[ロール間の関係と権限設計の説明]\n\n## 実装ステップ\n1. [ステップ1]\n2. [ステップ2]\n...\n\n提案は具体的かつ実行可能なものにし、サーバーの目的や文化を考慮してください。視覚的な要素（ロール階層図など）も含めると理解しやすくなります。"
        }
      }
    },
    name: "ロール最適化",
    description: "最適なロール構造と管理方法を提案します"
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
  IMAGE_GENERATION_DESCRIPTION_TEMPLATE,
  LOG_ANALYSIS_ASSISTANT_TEMPLATE,
  AI_CONVERSATION_ASSISTANT_TEMPLATE,
  LINK_SEARCH_SUMMARY_ASSISTANT_TEMPLATE,
  VOICE_RECOGNITION_ASSISTANT_TEMPLATE,
  PERSONAL_KNOWLEDGE_BASE_TEMPLATE,
  NEWS_TREND_ANALYSIS_TEMPLATE,
  SMART_NOTE_TAKING_TEMPLATE,
  SCHEDULE_OPTIMIZATION_TEMPLATE,
  ROLE_MANAGEMENT_TEMPLATE
};
