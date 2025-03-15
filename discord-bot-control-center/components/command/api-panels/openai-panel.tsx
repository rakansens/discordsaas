"use client";

/**
 * OpenAI設定パネル
 * Created: 2025/3/14
 * 
 * このコンポーネントは、OpenAI APIの設定インターフェースを提供します。
 */

import React from "react";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { OpenAISettings } from "@/types/api-config";
import { openaiModels } from "@/constants/api-services";

interface OpenAIPanelProps {
  settings: OpenAISettings;
  onUpdate: (key: string, value: any) => void;
}

export function OpenAIPanel({ settings, onUpdate }: OpenAIPanelProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="openai-model">モデル</Label>
        <Select
          value={settings.model}
          onValueChange={(value) => onUpdate("model", value)}
        >
          <SelectTrigger id="openai-model">
            <SelectValue placeholder="モデルを選択" />
          </SelectTrigger>
          <SelectContent>
            {openaiModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {settings.model !== "dall-e-3" && (
        <>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="openai-temperature">温度 ({settings.temperature})</Label>
            </div>
            <Slider
              id="openai-temperature"
              min={0}
              max={1}
              step={0.1}
              value={[settings.temperature || 0.7]}
              onValueChange={(value) => onUpdate("temperature", value[0])}
            />
            <p className="text-xs text-muted-foreground">
              低い値ほど予測可能な出力、高い値ほど多様な出力になります。
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="openai-max-tokens">最大トークン数</Label>
            <Input
              id="openai-max-tokens"
              type="number"
              min={1}
              max={4000}
              value={settings.maxTokens}
              onChange={(e) => onUpdate("maxTokens", parseInt(e.target.value) || 1000)}
            />
            <p className="text-xs text-muted-foreground">
              生成するテキストの最大長さ（トークン数）。
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="openai-system-prompt">システムプロンプト</Label>
            <Textarea
              id="openai-system-prompt"
              placeholder="AIの役割や指示を入力してください"
              value={settings.systemPrompt}
              onChange={(e) => onUpdate("systemPrompt", e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              AIの動作を制御するためのシステムプロンプト。
            </p>
          </div>
        </>
      )}

      {settings.model === "dall-e-3" && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
            <div>
              <p className="font-medium text-blue-500">画像生成モデル</p>
              <p className="text-sm text-muted-foreground">
                DALL-E 3は画像生成モデルです。ユーザーの入力はプロンプトとして使用され、画像が生成されます。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
