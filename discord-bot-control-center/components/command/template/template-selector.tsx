/**
 * テンプレート選択画面コンポーネント
 * Created: 2025/3/14
 * Updated: 2025/3/15 - 型の明示的な指定と関数のインポート修正
 * 
 * このコンポーネントは、コマンド作成時のテンプレート選択画面を提供します。
 */

"use client"

import { useState } from "react";
import { 
  TEMPLATE_CATEGORIES, 
  COMMAND_TEMPLATES
} from "@/constants/command-templates";
import { CommandTemplate, TemplateCategory, TemplateTag } from "@/types/template";
import { TemplateCard } from "./template-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, MessageSquare, Image, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";

// カテゴリアイコンのマッピング
const categoryIcons: Record<TemplateCategory, React.ReactNode> = {
  information: <Search className="h-5 w-5" />,
  conversation: <MessageSquare className="h-5 w-5" />,
  media: <Image className="h-5 w-5" />,
  utility: <Wrench className="h-5 w-5" />
};

interface TemplateSelectorProps {
  onSelectTemplate: (template: CommandTemplate) => void;
  onCancel: () => void;
  botId?: string;
}

export function TemplateSelector({ 
  onSelectTemplate, 
  onCancel,
  botId 
}: TemplateSelectorProps) {
  // 選択されたカテゴリ
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | null>(null);
  
  // 選択されたテンプレート
  const [selectedTemplate, setSelectedTemplate] = useState<CommandTemplate | null>(null);
  
  // 検索クエリ
  const [searchQuery, setSearchQuery] = useState("");
  
  // 人気のテンプレート
  const popularTemplates = COMMAND_TEMPLATES.filter(template => template.popular);
  
  // カテゴリ別のテンプレート
  const categoryTemplates = selectedCategory 
    ? COMMAND_TEMPLATES.filter(template => template.category === selectedCategory)
    : [];
  
  // 検索結果のフィルタリング
  const filteredTemplates = searchQuery.trim() !== ""
    ? [...popularTemplates, ...categoryTemplates].filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some((tag: TemplateTag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];
  
  // テンプレートの選択
  const handleSelectTemplate = (template: CommandTemplate) => {
    setSelectedTemplate(template);
  };
  
  // テンプレートの確定
  const handleConfirmTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">新しいコマンドを作成</h2>
        <p className="text-muted-foreground">
          テンプレートを選択して、簡単にコマンドを作成できます。
        </p>
      </div>
      
      {/* 検索バー */}
      <div>
        <Input
          placeholder="テンプレートを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>
      
      {searchQuery.trim() !== "" ? (
        // 検索結果
        <div className="space-y-4">
          <h3 className="text-lg font-medium">検索結果</h3>
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template: CommandTemplate) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={() => handleSelectTemplate(template)}
                  selected={selectedTemplate?.id === template.id}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              「{searchQuery}」に一致するテンプレートが見つかりませんでした。
            </p>
          )}
        </div>
      ) : (
        <>
          {/* カテゴリ選択 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">何をしたいですか？</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {TEMPLATE_CATEGORIES.map((category) => (
                <div
                  key={category.id}
                  className={`cursor-pointer p-4 rounded-lg border transition-all ${
                    selectedCategory === category.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50 hover:bg-primary/5"
                  }`}
                  onClick={() => setSelectedCategory(category.id as TemplateCategory)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedCategory === category.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}>
                      {categoryIcons[category.id as TemplateCategory]}
                    </div>
                    <h4 className="font-medium mt-2">{category.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 人気のテンプレート */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">人気のテンプレート</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularTemplates.map((template: CommandTemplate) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={() => handleSelectTemplate(template)}
                  selected={selectedTemplate?.id === template.id}
                />
              ))}
            </div>
          </div>
          
          {/* カテゴリ別テンプレート */}
          {selectedCategory && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                {TEMPLATE_CATEGORIES.find(c => c.id === selectedCategory)?.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryTemplates.map((template: CommandTemplate) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onClick={() => handleSelectTemplate(template)}
                    selected={selectedTemplate?.id === template.id}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      {/* ナビゲーションボタン */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        
        <Button 
          onClick={handleConfirmTemplate} 
          disabled={!selectedTemplate}
        >
          次へ
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
