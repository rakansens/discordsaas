"use client";

/**
 * API Integration Panel Component
 * Created: 2025/3/14
 * リファクタリング: 2025/3/14
 * 
 * このコンポーネントは、コマンドのAPI連携設定を行うためのインターフェースを提供します。
 * 様々なAPIサービス（OpenAI、Perplexity、Stability AIなど）との連携設定が可能です。
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ApiConfig, ApiService, defaultApiConfig } from "@/types/api-config";
import { Command } from "@/types/command";
import { apiServiceInfo } from "@/constants/api-services";

// 各APIサービスのパネルをインポート
import { OpenAIPanel } from "./api-panels/openai-panel";
import { PerplexityPanel } from "./api-panels/perplexity-panel";
import { StabilityPanel } from "./api-panels/stability-panel";
import { AnthropicPanel } from "./api-panels/anthropic-panel";
import { DeepLPanel } from "./api-panels/deepl-panel";
import { SpotifyPanel } from "./api-panels/spotify-panel";
import { YouTubePanel } from "./api-panels/youtube-panel";

interface ApiIntegrationPanelProps {
  apiConfig: Partial<ApiConfig>;
  command?: Partial<Command>;
  onChange: (apiConfig: ApiConfig) => void;
}

// "none"を除外したAPIサービスの型
type ActiveApiService = Exclude<ApiService, "none">;

export function ApiIntegrationPanel({
  apiConfig: initialApiConfig = {},
  command,
  onChange
}: ApiIntegrationPanelProps) {
  // 初期設定とデフォルト設定をマージ
  const [config, setConfig] = useState<ApiConfig>({
    ...defaultApiConfig,
    ...initialApiConfig,
    settings: {
      ...defaultApiConfig.settings,
      ...initialApiConfig.settings
    }
  });

  // 設定が変更されたときに親コンポーネントに通知
  useEffect(() => {
    // 初期設定と現在の設定を比較
    const initialConfigStr = JSON.stringify({
      ...defaultApiConfig,
      ...initialApiConfig,
      settings: {
        ...defaultApiConfig.settings,
        ...initialApiConfig.settings
      }
    });
    const currentConfigStr = JSON.stringify(config);
    
    // 設定が変更された場合のみ通知
    if (initialConfigStr !== currentConfigStr) {
      onChange(config);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  // APIサービスを変更
  const handleServiceChange = (service: ApiService) => {
    setConfig({
      ...config,
      service
    });
  };

  // 各サービスの設定を更新するハンドラー
  const updateServiceSettings = (service: ActiveApiService, key: string, value: any) => {
    setConfig({
      ...config,
      settings: {
        ...config.settings,
        [service]: {
          ...config.settings[service],
          [key]: value
        }
      }
    });
  };

  // 選択されたAPIサービスに応じた設定パネルを表示
  const renderSettingsPanel = () => {
    switch (config.service) {
      case "openai":
        return (
          <OpenAIPanel 
            settings={config.settings.openai || {}} 
            onUpdate={(key, value) => updateServiceSettings("openai", key, value)} 
          />
        );
      case "perplexity":
        return (
          <PerplexityPanel 
            settings={config.settings.perplexity || {}} 
            onUpdate={(key, value) => updateServiceSettings("perplexity", key, value)} 
          />
        );
      case "stability":
        return (
          <StabilityPanel 
            settings={config.settings.stability || {}} 
            onUpdate={(key, value) => updateServiceSettings("stability", key, value)} 
          />
        );
      case "anthropic":
        return (
          <AnthropicPanel 
            settings={config.settings.anthropic || {}} 
            onUpdate={(key, value) => updateServiceSettings("anthropic", key, value)} 
          />
        );
      case "deepl":
        return (
          <DeepLPanel 
            settings={config.settings.deepl || {}} 
            onUpdate={(key, value) => updateServiceSettings("deepl", key, value)} 
          />
        );
      case "spotify":
        return (
          <SpotifyPanel 
            settings={config.settings.spotify || {}} 
            onUpdate={(key, value) => updateServiceSettings("spotify", key, value)} 
          />
        );
      case "youtube":
        return (
          <YouTubePanel 
            settings={config.settings.youtube || {}} 
            onUpdate={(key, value) => updateServiceSettings("youtube", key, value)} 
          />
        );
      default:
        return (
          <div className="p-4 text-center text-muted-foreground">
            API連携なし
          </div>
        );
    }
  };

  // コマンドにAPIフローが設定されているかどうかを確認
  const hasApiFlow = useMemo(() => {
    // commandプロパティを確認
    return command?.apiFlow && command.apiFlow.length > 0;
  }, [command]);

  return (
    <div className="space-y-4">
      {hasApiFlow && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-4 mb-4">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-700">複数API連携フローが設定されています</p>
              <p className="text-xs text-blue-600 mt-1">
                このテンプレートには複数のAPIを連携させるフローが設定されています。
                「複数API連携フローを設定」ボタンをクリックして詳細を確認してください。
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Select
          value={config.service}
          onValueChange={(value: ApiService) => handleServiceChange(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="APIサービスを選択" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(apiServiceInfo).map(([key, info]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center">
                  <span className="mr-2">{info.icon}</span>
                  <span>{info.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {config.service !== "none" && (
          <p className="text-xs text-muted-foreground">
            {apiServiceInfo[config.service].description}
          </p>
        )}
      </div>

      {config.service !== "none" && (
        <Card>
          <CardContent className="pt-6">
            {renderSettingsPanel()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
