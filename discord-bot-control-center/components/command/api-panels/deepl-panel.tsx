"use client";

/**
 * DeepL設定パネル
 * Created: 2025/3/14
 * 
 * このコンポーネントは、DeepL APIの設定インターフェースを提供します。
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
import { DeepLSettings } from "@/types/api-config";

interface DeepLPanelProps {
  settings: DeepLSettings;
  onUpdate: (key: string, value: any) => void;
}

export function DeepLPanel({ settings, onUpdate }: DeepLPanelProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="deepl-target-lang">翻訳先言語</Label>
        <Select
          value={settings.targetLang}
          onValueChange={(value) => onUpdate("targetLang", value)}
        >
          <SelectTrigger id="deepl-target-lang">
            <SelectValue placeholder="言語を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="JA">日本語</SelectItem>
            <SelectItem value="EN">英語</SelectItem>
            <SelectItem value="DE">ドイツ語</SelectItem>
            <SelectItem value="FR">フランス語</SelectItem>
            <SelectItem value="ES">スペイン語</SelectItem>
            <SelectItem value="IT">イタリア語</SelectItem>
            <SelectItem value="ZH">中国語</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deepl-formality">フォーマリティ</Label>
        <Select
          value={settings.formality}
          onValueChange={(value: "default" | "more" | "less") => onUpdate("formality", value)}
        >
          <SelectTrigger id="deepl-formality">
            <SelectValue placeholder="フォーマリティを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">デフォルト</SelectItem>
            <SelectItem value="more">より丁寧</SelectItem>
            <SelectItem value="less">よりカジュアル</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          翻訳文のフォーマリティ（丁寧さ）を設定します。
        </p>
      </div>
    </div>
  );
}
