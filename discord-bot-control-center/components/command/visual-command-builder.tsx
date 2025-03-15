/**
 * Visual Command Builder Component
 * Created: 2025/3/14
 * 
 * このコンポーネントは、Discordボットコマンドの構造を視覚的に構築するための
 * インターフェースを提供します。コマンド、サブコマンド、オプションをブロックとして
 * 視覚的に配置し、各要素間の関係を線や階層で表現します。
 */

"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, useDragControls, Reorder } from "framer-motion"
import { 
  Terminal, 
  Plus, 
  Trash2, 
  GripVertical, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  ArrowRight,
  Slash,
  Braces,
  User,
  Hash,
  ToggleLeft,
  Type,
  ListOrdered
} from "lucide-react"
import { CommandOption, CommandOptionType } from "@/types/command"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// オプションタイプのアイコンマッピング
const optionTypeIcons: Record<CommandOptionType, React.ReactNode> = {
  "string": <Type className="h-4 w-4" />,
  "integer": <ListOrdered className="h-4 w-4" />,
  "boolean": <ToggleLeft className="h-4 w-4" />,
  "user": <User className="h-4 w-4" />,
  "channel": <Hash className="h-4 w-4" />,
  "role": <Braces className="h-4 w-4" />,
  "mentionable": <User className="h-4 w-4" />
};

// オプションタイプの表示名マッピング
const optionTypeLabels: Record<CommandOptionType, string> = {
  "string": "テキスト",
  "integer": "数値",
  "boolean": "真偽値",
  "user": "ユーザー",
  "channel": "チャンネル",
  "role": "ロール",
  "mentionable": "メンション可能"
};

// 空のオプションを作成する関数
const createEmptyOption = (): CommandOption => ({
  name: "",
  description: "",
  type: "string",
  required: false,
  choices: []
});

interface VisualCommandBuilderProps {
  commandName: string;
  options: CommandOption[];
  onChange: (options: CommandOption[]) => void;
}

export function VisualCommandBuilder({ 
  commandName,
  options = [], 
  onChange 
}: VisualCommandBuilderProps) {
  // 内部状態としてのオプションリスト
  const [localOptions, setLocalOptions] = useState<CommandOption[]>(options);
  // 選択されたオプション
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  // 編集モード
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  // 編集中のオプション
  const [editingOption, setEditingOption] = useState<CommandOption | null>(null);
  // バリデーションエラー
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // 親コンポーネントからのオプションが変更された場合に内部状態を更新
  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  // オプションが変更されたときに親コンポーネントに通知
  const updateOptions = (newOptions: CommandOption[]) => {
    setLocalOptions(newOptions);
    onChange(newOptions);
    validateOptions(newOptions);
  };

  // オプションの検証
  const validateOptions = (optionsToValidate: CommandOption[]) => {
    const errors: Record<string, string[]> = {};
    
    optionsToValidate.forEach((option, index) => {
      const optionErrors: string[] = [];
      
      if (!option.name) {
        optionErrors.push("名前は必須です");
      } else if (!/^[\w-]+$/.test(option.name)) {
        optionErrors.push("名前には英数字、アンダースコア、ハイフンのみ使用できます");
      }
      
      if (!option.description) {
        optionErrors.push("説明は必須です");
      }
      
      if (option.choices && option.choices.length > 0) {
        const hasEmptyChoice = option.choices.some(choice => 
          !choice.name || (typeof choice.value === 'string' && !choice.value)
        );
        if (hasEmptyChoice) {
          optionErrors.push("選択肢の名前と値は必須です");
        }
      }
      
      if (optionErrors.length > 0) {
        errors[index.toString()] = optionErrors;
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 新しいオプションを追加
  const addOption = () => {
    const newOption = createEmptyOption();
    const newOptions = [...localOptions, newOption];
    updateOptions(newOptions);
    
    // 新しく追加したオプションを選択
    setSelectedOptionIndex(newOptions.length - 1);
    setEditingOption(newOption);
    setIsEditMode(true);
  };

  // オプションを削除
  const removeOption = (index: number) => {
    const newOptions = localOptions.filter((_, i) => i !== index);
    updateOptions(newOptions);
    
    // 選択されたオプションが削除された場合、選択を解除
    if (selectedOptionIndex === index) {
      setSelectedOptionIndex(null);
      setEditingOption(null);
      setIsEditMode(false);
    } else if (selectedOptionIndex !== null && selectedOptionIndex > index) {
      // 削除されたオプションより後ろのオプションが選択されていた場合、インデックスを調整
      setSelectedOptionIndex(selectedOptionIndex - 1);
    }
  };

  // オプションを選択
  const selectOption = (index: number) => {
    if (selectedOptionIndex === index) {
      // 既に選択されているオプションをクリックした場合、編集モードを切り替え
      setIsEditMode(!isEditMode);
    } else {
      // 別のオプションを選択した場合
      setSelectedOptionIndex(index);
      setEditingOption(localOptions[index]);
      setIsEditMode(true);
    }
  };

  // オプションの順序を変更
  const handleReorder = (newOrder: CommandOption[]) => {
    updateOptions(newOrder);
    
    // 選択されたオプションのインデックスを更新
    if (selectedOptionIndex !== null && editingOption) {
      const newIndex = newOrder.findIndex(option => 
        option.name === editingOption.name && 
        option.description === editingOption.description
      );
      if (newIndex !== -1) {
        setSelectedOptionIndex(newIndex);
      }
    }
  };

  // 編集中のオプションを更新
  const updateEditingOption = (key: keyof CommandOption, value: any) => {
    if (editingOption && selectedOptionIndex !== null) {
      const updatedOption = { ...editingOption, [key]: value };
      setEditingOption(updatedOption);
      
      const newOptions = [...localOptions];
      newOptions[selectedOptionIndex] = updatedOption;
      updateOptions(newOptions);
    }
  };

  // 選択肢を追加
  const addChoice = () => {
    if (editingOption && selectedOptionIndex !== null) {
      const choices = editingOption.choices || [];
      const updatedChoices = [
        ...choices, 
        { 
          name: "", 
          value: editingOption.type === 'integer' ? 0 : "" 
        }
      ];
      
      updateEditingOption('choices', updatedChoices);
    }
  };

  // 選択肢を削除
  const removeChoice = (choiceIndex: number) => {
    if (editingOption && selectedOptionIndex !== null && editingOption.choices) {
      const updatedChoices = editingOption.choices.filter((_, i) => i !== choiceIndex);
      updateEditingOption('choices', updatedChoices);
    }
  };

  // 選択肢を更新
  const updateChoice = (choiceIndex: number, key: 'name' | 'value', value: string | number) => {
    if (editingOption && selectedOptionIndex !== null && editingOption.choices) {
      const updatedChoices = [...editingOption.choices];
      updatedChoices[choiceIndex] = { 
        ...updatedChoices[choiceIndex], 
        [key]: key === 'value' && editingOption.type === 'integer' ? parseInt(value as string) || 0 : value 
      };
      
      updateEditingOption('choices', updatedChoices);
    }
  };

  // コマンドプレビューを生成
  const generateCommandPreview = () => {
    let preview = `/${commandName}`;
    
    localOptions.forEach(option => {
      const prefix = option.required ? '<' : '[';
      const suffix = option.required ? '>' : ']';
      preview += ` ${prefix}${option.name}${suffix}`;
    });
    
    return preview;
  };

  return (
    <div className="space-y-6">
      {/* コマンドプレビュー */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">コマンドプレビュー</CardTitle>
          <CardDescription>
            ユーザーから見たコマンドの表示
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-3 rounded-md font-mono text-sm">
            {generateCommandPreview()}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* オプションリスト */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">コマンドオプション</h3>
            <Button 
              onClick={addOption} 
              variant="outline" 
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              オプションを追加
            </Button>
          </div>
          
          {localOptions.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-md">
              <p className="text-muted-foreground">
                オプションがありません。「オプションを追加」ボタンをクリックしてオプションを追加してください。
              </p>
            </div>
          ) : (
            <Reorder.Group 
              axis="y" 
              values={localOptions} 
              onReorder={handleReorder}
              className="space-y-2"
            >
              {localOptions.map((option, index) => (
                <Reorder.Item
                  key={`${option.name}-${index}`}
                  value={option}
                  className={`border rounded-md overflow-hidden cursor-move ${
                    selectedOptionIndex === index ? 'border-primary' : ''
                  }`}
                >
                  <div 
                    className={`flex items-center p-3 ${
                      selectedOptionIndex === index ? 'bg-primary/10' : ''
                    }`}
                    onClick={() => selectOption(index)}
                  >
                    <div className="mr-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        {option.name ? (
                          <span className="font-medium">{option.name}</span>
                        ) : (
                          <span className="text-muted-foreground">未命名オプション</span>
                        )}
                        {option.type && (
                          <Badge variant="outline" className="ml-2">
                            <span className="mr-1">{optionTypeIcons[option.type]}</span>
                            {optionTypeLabels[option.type]}
                          </Badge>
                        )}
                        {option.required && (
                          <Badge className="ml-1 bg-red-500/10 text-red-500 border-red-500/20">
                            必須
                          </Badge>
                        )}
                      </div>
                      {option.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {option.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOption(index);
                      }}
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {validationErrors[index.toString()] && (
                    <div className="p-2 bg-red-500/10 border-t border-red-500/20">
                      <div className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
                        <div>
                          <ul className="text-xs text-red-500 list-disc list-inside">
                            {validationErrors[index.toString()].map((error, i) => (
                              <li key={i}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </div>
        
        {/* オプション編集パネル */}
        <div className="md:col-span-2">
          {selectedOptionIndex !== null && editingOption && isEditMode ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">オプション編集</CardTitle>
                <CardDescription>
                  選択したオプションの詳細を編集します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="option-name">名前</Label>
                    <Input
                      id="option-name"
                      value={editingOption.name}
                      onChange={(e) => updateEditingOption('name', e.target.value)}
                      placeholder="例: user"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="option-type">タイプ</Label>
                    <Select
                      value={editingOption.type}
                      onValueChange={(value: CommandOptionType) => updateEditingOption('type', value)}
                    >
                      <SelectTrigger id="option-type">
                        <SelectValue placeholder="タイプを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(optionTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center">
                              <span className="mr-2">{optionTypeIcons[value as CommandOptionType]}</span>
                              {label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="option-description">説明</Label>
                  <Input
                    id="option-description"
                    value={editingOption.description}
                    onChange={(e) => updateEditingOption('description', e.target.value)}
                    placeholder="例: BANするユーザー"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="option-required"
                    checked={editingOption.required}
                    onCheckedChange={(checked: boolean | 'indeterminate') => 
                      updateEditingOption('required', checked === true)
                    }
                  />
                  <Label htmlFor="option-required">必須オプション</Label>
                </div>
                
                {/* 選択肢セクション (文字列または数値タイプの場合のみ表示) */}
                {(editingOption.type === 'string' || editingOption.type === 'integer') && (
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between items-center">
                      <Label>選択肢</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addChoice}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        選択肢を追加
                      </Button>
                    </div>
                    
                    {(!editingOption.choices || editingOption.choices.length === 0) ? (
                      <p className="text-sm text-muted-foreground">
                        選択肢を追加すると、ユーザーは定義された選択肢からのみ選択できるようになります。
                      </p>
                    ) : (
                      <div className="space-y-2 border rounded-md p-3">
                        {editingOption.choices.map((choice, choiceIndex) => (
                          <div key={choiceIndex} className="flex items-center space-x-2">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <Input
                                value={choice.name}
                                onChange={(e) => updateChoice(choiceIndex, 'name', e.target.value)}
                                placeholder="表示名"
                                size={1}
                              />
                              <Input
                                value={choice.value}
                                onChange={(e) => updateChoice(choiceIndex, 'value', e.target.value)}
                                placeholder="値"
                                type={editingOption.type === 'integer' ? 'number' : 'text'}
                                size={1}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeChoice(choiceIndex)}
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full border border-dashed rounded-md p-8">
              <div className="text-center">
                <Terminal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">オプションを選択</h3>
                <p className="text-muted-foreground mt-1">
                  左側のリストからオプションを選択して編集するか、新しいオプションを追加してください。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
