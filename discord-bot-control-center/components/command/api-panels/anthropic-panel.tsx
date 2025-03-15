"use client";

/**
 * Anthropic設定パネル
 * Created: 2025/3/14
 * 
 * このコンポーネントは、Anthropic APIの設定インターフェースを提供します。
 */

import React from "react";
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
import { AnthropicSettings } from "@/types/api-config";
import { anthropicModels } from "@/constants/api-services";

interface AnthropicPanelProps {
  settings: AnthropicSettings;
  onUpdate: (key: string, value: any) => void;
}

export function AnthropicPanel({ settings, onUpdate }: AnthropicPanelProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="anthropic-model">モデル</Label>
        <Select
          value={settings.model}
          onValueChange={(value) => onUpdate("model", value)}
        >
          <SelectTrigger id="anthropic-model">
            <SelectValue placeholder="モデルを選択" />
          </SelectTrigger>
          <SelectContent>
            {anthropicModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="anthropic-temperature">温度 ({settings.temperature})</Label>
        </div>
        <Slider
          id="anthropic-temperature"
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
        <Label htmlFor="anthropic-max-tokens">最大トークン数</Label>
        <Input
          id="anthropic-max-tokens"
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
        <Label htmlFor="anthropic-system-prompt">システムプロンプト</Label>
        <Textarea
          id="anthropic-system-prompt"
          placeholder="AIの役割や指示を入力してください"
          value={settings.systemPrompt}
          onChange={(e) => onUpdate("systemPrompt", e.target.value)}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          AIの動作を制御するためのシステムプロンプト。
        </p>
      </div>
    </div>
  );
}
