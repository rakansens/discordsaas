"use client";

/**
 * Spotify設定パネル
 * Created: 2025/3/14
 * 
 * このコンポーネントは、Spotify APIの設定インターフェースを提供します。
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
import { SpotifySettings } from "@/types/api-config";

interface SpotifyPanelProps {
  settings: SpotifySettings;
  onUpdate: (key: string, value: any) => void;
}

export function SpotifyPanel({ settings, onUpdate }: SpotifyPanelProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="spotify-type">検索タイプ</Label>
        <Select
          value={settings.type}
          onValueChange={(value: "track" | "album" | "artist" | "playlist") => onUpdate("type", value)}
        >
          <SelectTrigger id="spotify-type">
            <SelectValue placeholder="タイプを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="track">トラック</SelectItem>
            <SelectItem value="album">アルバム</SelectItem>
            <SelectItem value="artist">アーティスト</SelectItem>
            <SelectItem value="playlist">プレイリスト</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="spotify-market">マーケット</Label>
        <Select
          value={settings.market}
          onValueChange={(value) => onUpdate("market", value)}
        >
          <SelectTrigger id="spotify-market">
            <SelectValue placeholder="マーケットを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="JP">日本</SelectItem>
            <SelectItem value="US">アメリカ</SelectItem>
            <SelectItem value="GB">イギリス</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          検索対象のマーケット（国）を指定します。
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="spotify-limit">結果数上限</Label>
        <Input
          id="spotify-limit"
          type="number"
          min={1}
          max={50}
          value={settings.limit}
          onChange={(e) => onUpdate("limit", parseInt(e.target.value) || 10)}
        />
        <p className="text-xs text-muted-foreground">
          返される結果の最大数（1〜50）。
        </p>
      </div>
    </div>
  );
}
