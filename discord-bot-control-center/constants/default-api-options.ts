/**
 * デフォルトAPIオプション
 * Created: 2025/3/14
 * 
 * このファイルは、各APIサービスのデフォルト設定とプロンプトテンプレートを提供します。
 */

import { ApiService } from "@/types/api-config";

// APIサービスごとのデフォルトプロンプトテンプレート
export const defaultApiPromptTemplates: Record<ApiService, string> = {
  "none": "",
  "openai": `あなたはDiscordボットのアシスタントです。
ユーザーからの質問に対して、簡潔かつ正確に回答してください。

質問: {question}

回答:`,

  "anthropic": `あなたはDiscordボットのアシスタントです。
ユーザーからの質問に対して、丁寧かつ詳細に回答してください。
{persona}のペルソナで回答します。

質問: {question}

回答:`,

  "perplexity": `以下の検索クエリに関する情報を収集し、{detail_level}形式で要約してください。

検索クエリ: {query}

# 検索結果の要約

{summary}

# 主要な情報源

{sources}

検索実行: {timestamp}`,

  "stability": `画像生成プロンプト:
{prompt}

スタイル: {style}
サイズ: {size}`,

  "deepl": `以下のテキストを{target_language}に翻訳してください:

原文:
{text}

翻訳:`,

  "spotify": `以下の条件に合った音楽を検索します:

検索クエリ: {query}
ジャンル: {genre}
人気度: {popularity}

検索結果:`,

  "youtube": `以下の条件に合った動画を検索します:

検索クエリ: {query}
カテゴリ: {category}
並び順: {sort}

検索結果:`
};

// APIサービスごとのデフォルト設定
export const defaultApiSettings: Record<ApiService, Record<string, any>> = {
  "none": {},
  "openai": {
    model: "gpt-4",
    temperature: 0.7,
    max_tokens: 1000
  },
  "anthropic": {
    model: "claude-3-sonnet",
    temperature: 0.7,
    max_tokens: 1000
  },
  "perplexity": {
    model: "pplx-7b-online",
    temperature: 0.5
  },
  "stability": {
    engine: "stable-diffusion-xl-1024-v1-0",
    steps: 30,
    cfg_scale: 7
  },
  "deepl": {
    formality: "default"
  },
  "spotify": {
    limit: 10,
    market: "JP"
  },
  "youtube": {
    max_results: 10,
    region_code: "JP"
  }
};
