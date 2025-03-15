/**
 * Basic Step Component
 * Created: 2025/3/15
 * 
 * このコンポーネントは、コマンドウィザードの基本情報ステップを表示します。
 * ボット選択、コマンド名、説明、API連携の選択などの基本情報を設定できます。
 */

import { ApiService } from "@/types/api-config"
import { Command } from "@/types/command"
import { StepProps } from "../command-wizard-types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Card,
  CardContent
} from "@/components/ui/card"

export function BasicStep({
  command,
  updateCommand,
  errors,
  apiConfig,
  updateApiConfig,
  bots
}: StepProps) {
  // 基本情報の更新
  const updateBasicInfo = (key: keyof Command, value: any) => {
    updateCommand({
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bot-id">ボット</Label>
          <Select
            value={command.botId}
            onValueChange={(value) => updateBasicInfo("botId", value)}
          >
            <SelectTrigger id="bot-id">
              <SelectValue placeholder="ボットを選択" />
            </SelectTrigger>
            <SelectContent>
              {bots.map((bot) => (
                <SelectItem key={bot.id} value={bot.id}>
                  {bot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.botId && (
            <p className="text-sm text-red-500">{errors.botId}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="command-name">コマンド名</Label>
          <Input
            id="command-name"
            value={command.name}
            onChange={(e) => updateBasicInfo("name", e.target.value)}
            placeholder="例: ban"
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="command-description">説明</Label>
          <Input
            id="command-description"
            value={command.description}
            onChange={(e) => updateBasicInfo("description", e.target.value)}
            placeholder="例: ユーザーをBANします"
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="text-lg font-medium mb-3">API連携の選択</h4>
        <p className="text-sm text-muted-foreground mb-4">
          コマンドで使用するAPI連携を選択してください。API連携を選択すると、そのAPIに関連するコマンドやオプションが自動的に提案されます。
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { id: "none", name: "なし", description: "API連携なし" },
            { id: "openai", name: "OpenAI", description: "AIによる文章生成や画像生成" },
            { id: "anthropic", name: "Anthropic", description: "Claude AIによる高度な文章生成" },
            { id: "perplexity", name: "Perplexity", description: "最新情報を含む質問応答" },
            { id: "stability", name: "Stability AI", description: "高品質な画像生成" },
            { id: "deepl", name: "DeepL", description: "高精度な翻訳" },
            { id: "spotify", name: "Spotify", description: "音楽の検索や再生" },
            { id: "youtube", name: "YouTube", description: "動画の検索や情報取得" }
          ].map(api => (
            <Card 
              key={api.id}
              className={`cursor-pointer transition-all ${
                apiConfig?.service === api.id 
                  ? "border-primary bg-primary/5" 
                  : "hover:border-primary/50 hover:bg-primary/5"
              }`}
              onClick={() => updateApiConfig({ service: api.id as ApiService, settings: {} })}
            >
              <CardContent className="p-3">
                <div className="font-medium">{api.name}</div>
                <p className="text-xs text-muted-foreground">{api.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
