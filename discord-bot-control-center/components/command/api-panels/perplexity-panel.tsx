"use client";

/**
 * Perplexity設定パネル
 * Created: 2025/3/14
 * 
 * このコンポーネントは、Perplexity APIの設定インターフェースを提供します。
 */

import React from "react";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PerplexitySettings } from "@/types/api-config";

interface PerplexityPanelProps {
  settings: PerplexitySettings;
  onUpdate: (key: string, value: any) => void;
}

export function PerplexityPanel({ settings, onUpdate }: PerplexityPanelProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="perplexity-mode">モード</Label>
        <Select
          value={settings.mode}
          onValueChange={(value: "search" | "answer") => onUpdate("mode", value)}
        >
          <SelectTrigger id="perplexity-mode">
            <SelectValue placeholder="モードを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="search">検索モード</SelectItem>
            <SelectItem value="answer">回答モード</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          検索モードは検索結果のリストを返し、回答モードは質問に対する詳細な回答を生成します。
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="perplexity-detail-level">詳細度</Label>
        <Select
          value={settings.detailLevel}
          onValueChange={(value: "concise" | "detailed") => onUpdate("detailLevel", value)}
        >
          <SelectTrigger id="perplexity-detail-level">
            <SelectValue placeholder="詳細度を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="concise">簡潔</SelectItem>
            <SelectItem value="detailed">詳細</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          簡潔は短い回答、詳細はより包括的な回答を生成します。
        </p>
      </div>
    </div>
  );
}
