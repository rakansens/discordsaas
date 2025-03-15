/**
 * テンプレートカードコンポーネント
 * Created: 2025/3/14
 * 
 * このコンポーネントは、コマンドテンプレートを表示するカードUIを提供します。
 */

"use client"

import { CommandTemplate, TemplateDifficulty } from "@/types/template";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  MessageSquare, 
  Search, 
  Image, 
  Wrench,
  Zap,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

// 難易度に応じたラベルとカラー
const difficultyConfig: Record<TemplateDifficulty, { label: string; color: string }> = {
  beginner: { 
    label: "初級", 
    color: "bg-green-500/10 text-green-500 border-green-500/20" 
  },
  intermediate: { 
    label: "中級", 
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20" 
  },
  advanced: { 
    label: "上級", 
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20" 
  }
};

// カテゴリに応じたアイコン
const categoryIcons: Record<string, React.ReactNode> = {
  information: <Search className="h-4 w-4" />,
  conversation: <MessageSquare className="h-4 w-4" />,
  media: <Image className="h-4 w-4" />,
  utility: <Wrench className="h-4 w-4" />
};

interface TemplateCardProps {
  template: CommandTemplate;
  onClick?: () => void;
  selected?: boolean;
}

export function TemplateCard({ template, onClick, selected = false }: TemplateCardProps) {
  const difficulty = difficultyConfig[template.difficulty];
  const categoryIcon = categoryIcons[template.category];
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5",
        selected && "border-primary bg-primary/5"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              {categoryIcon}
              <span className="text-xs text-muted-foreground">
                {template.category === "information" && "情報収集・分析"}
                {template.category === "conversation" && "対話・質問応答"}
                {template.category === "media" && "メディア処理"}
                {template.category === "utility" && "ユーティリティ"}
              </span>
              {template.popular && (
                <Badge variant="outline" className="ml-auto bg-amber-500/10 text-amber-500 border-amber-500/20">
                  <Star className="h-3 w-3 mr-1" />
                  人気
                </Badge>
              )}
            </div>
            
            <h3 className="font-medium">{template.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
            
            <div className="flex flex-wrap gap-1 mt-3">
              <Badge variant="outline" className={difficulty.color}>
                {difficulty.label}
              </Badge>
              
              {template.defaultCommand.apiService && (
                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
                  <Zap className="h-3 w-3 mr-1" />
                  {template.defaultCommand.apiService === "openai" && "OpenAI"}
                  {template.defaultCommand.apiService === "anthropic" && "Anthropic"}
                  {template.defaultCommand.apiService === "perplexity" && "Perplexity"}
                  {template.defaultCommand.apiService === "stability" && "Stability AI"}
                </Badge>
              )}
              
              {template.tags.includes("ai") && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
