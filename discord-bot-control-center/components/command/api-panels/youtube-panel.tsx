"use client";

/**
 * YouTube設定パネル
 * Created: 2025/3/14
 * 
 * このコンポーネントは、YouTube APIの設定インターフェースを提供します。
 */

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { YouTubeSettings } from "@/types/api-config";

interface YouTubePanelProps {
  settings: YouTubeSettings;
  onUpdate: (key: string, value: any) => void;
}

export function YouTubePanel({ settings, onUpdate }: YouTubePanelProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="youtube-type">検索タイプ</Label>
        <Select
          value={settings.type}
          onValueChange={(value: "video" | "channel" | "playlist") => onUpdate("type", value)}
        >
          <SelectTrigger id="youtube-type">
            <SelectValue placeholder="タイプを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video">動画</SelectItem>
            <SelectItem value="channel">チャンネル</SelectItem>
            <SelectItem value="playlist">プレイリスト</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="youtube-order">並び順</Label>
        <Select
          value={settings.order}
          onValueChange={(value: "relevance" | "date" | "rating" | "viewCount") => onUpdate("order", value)}
        >
          <SelectTrigger id="youtube-order">
            <SelectValue placeholder="並び順を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">関連性</SelectItem>
            <SelectItem value="date">日付</SelectItem>
            <SelectItem value="rating">評価</SelectItem>
            <SelectItem value="viewCount">再生回数</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          検索結果の並び順を指定します。
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="youtube-max-results">結果数上限</Label>
        <Input
          id="youtube-max-results"
          type="number"
          min={1}
          max={50}
          value={settings.maxResults}
          onChange={(e) => onUpdate("maxResults", parseInt(e.target.value) || 10)}
        />
        <p className="text-xs text-muted-foreground">
          返される結果の最大数（1〜50）。
        </p>
      </div>
    </div>
  );
}
