"use client";

/**
 * API Integration Panel Component
 * Created: 2025/3/14
 * リファクタリング: 2025/3/14
 * 
 * このコンポーネントは、コマンドのAPI連携設定を行うためのインターフェースを提供します。
 * 様々なAPIサービス（OpenAI、Perplexity、Stability AIなど）との連携設定が可能です。
 */

import React, { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ApiConfig, ApiService, defaultApiConfig } from "@/types/api-config";
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
  onChange: (apiConfig: ApiConfig) => void;
}

// "none"を除外したAPIサービスの型
type ActiveApiService = Exclude<ApiService, "none">;

export function ApiIntegrationPanel({
  apiConfig: initialApiConfig = {},
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
    onChange(config);
  }, [config, onChange]);

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

  return (
    <div className="space-y-4">
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
