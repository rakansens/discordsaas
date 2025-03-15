"use client";

/**
 * Stability AI設定パネル
 * Created: 2025/3/14
 * 
 * このコンポーネントは、Stability AI APIの設定インターフェースを提供します。
 */

import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { StabilitySettings } from "@/types/api-config";
import { stabilityModels } from "@/constants/api-services";

interface StabilityPanelProps {
  settings: StabilitySettings;
  onUpdate: (key: string, value: any) => void;
}

export function StabilityPanel({ settings, onUpdate }: StabilityPanelProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="stability-model">モデル</Label>
        <Select
          value={settings.model}
          onValueChange={(value) => onUpdate("model", value)}
        >
          <SelectTrigger id="stability-model">
            <SelectValue placeholder="モデルを選択" />
          </SelectTrigger>
          <SelectContent>
            {stabilityModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="stability-steps">ステップ数 ({settings.steps})</Label>
        </div>
        <Slider
          id="stability-steps"
          min={10}
          max={50}
          step={1}
          value={[settings.steps || 30]}
          onValueChange={(value) => onUpdate("steps", value[0])}
        />
        <p className="text-xs text-muted-foreground">
          生成ステップ数。高い値ほど品質が向上しますが、生成時間が長くなります。
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="stability-cfg-scale">CFGスケール ({settings.cfgScale})</Label>
        </div>
        <Slider
          id="stability-cfg-scale"
          min={1}
          max={15}
          step={0.5}
          value={[settings.cfgScale || 7]}
          onValueChange={(value) => onUpdate("cfgScale", value[0])}
        />
        <p className="text-xs text-muted-foreground">
          プロンプトへの忠実度。高い値ほどプロンプトに忠実な画像が生成されます。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stability-width">幅</Label>
          <Select
            value={settings.width?.toString()}
            onValueChange={(value) => onUpdate("width", parseInt(value))}
          >
            <SelectTrigger id="stability-width">
              <SelectValue placeholder="幅を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="512">512px</SelectItem>
              <SelectItem value="768">768px</SelectItem>
              <SelectItem value="1024">1024px</SelectItem>
              <SelectItem value="1280">1280px</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="stability-height">高さ</Label>
          <Select
            value={settings.height?.toString()}
            onValueChange={(value) => onUpdate("height", parseInt(value))}
          >
            <SelectTrigger id="stability-height">
              <SelectValue placeholder="高さを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="512">512px</SelectItem>
              <SelectItem value="768">768px</SelectItem>
              <SelectItem value="1024">1024px</SelectItem>
              <SelectItem value="1280">1280px</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
