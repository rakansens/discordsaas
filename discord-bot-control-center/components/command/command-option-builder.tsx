/**
 * Command Option Builder Component
 * Created: 2025/3/14
 * 
 * このコンポーネントは、Discordボットコマンドのオプションを動的に追加・編集・削除・並び替えるための
 * インターフェースを提供します。
 */

"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  ChevronDown, 
  ChevronUp,
  AlertCircle
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

interface CommandOptionBuilderProps {
  options: CommandOption[];
  onChange: (options: CommandOption[]) => void;
}

export function CommandOptionBuilder({ 
  options = [], 
  onChange 
}: CommandOptionBuilderProps) {
  // 内部状態としてのオプションリスト
  const [localOptions, setLocalOptions] = useState<CommandOption[]>(options);
  // 現在開いているアコーディオンアイテム
  const [openItems, setOpenItems] = useState<string[]>([]);
  // 検証エラー
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
    
    // 新しく追加したオプションのアコーディオンを開く
    setOpenItems([...openItems, `option-${newOptions.length - 1}`]);
  };

  // オプションを削除
  const removeOption = (index: number) => {
    const newOptions = localOptions.filter((_, i) => i !== index);
    updateOptions(newOptions);
    
    // 削除したオプションのアコーディオンを閉じる
    setOpenItems(openItems.filter(item => item !== `option-${index}`));
  };

  // オプションを上に移動
  const moveOptionUp = (index: number) => {
    if (index === 0) return;
    
    const newOptions = [...localOptions];
    const temp = newOptions[index];
    newOptions[index] = newOptions[index - 1];
    newOptions[index - 1] = temp;
    
    updateOptions(newOptions);
  };

  // オプションを下に移動
  const moveOptionDown = (index: number) => {
    if (index === localOptions.length - 1) return;
    
    const newOptions = [...localOptions];
    const temp = newOptions[index];
    newOptions[index] = newOptions[index + 1];
    newOptions[index + 1] = temp;
    
    updateOptions(newOptions);
  };

  // オプションのプロパティを更新
  const updateOption = (index: number, key: keyof CommandOption, value: any) => {
    const newOptions = [...localOptions];
    newOptions[index] = { ...newOptions[index], [key]: value };
    
    // タイプが変更された場合、選択肢をリセット
    if (key === 'type' && (value !== 'string' && value !== 'integer')) {
      newOptions[index].choices = [];
    }
    
    updateOptions(newOptions);
  };

  // 選択肢を追加
  const addChoice = (optionIndex: number) => {
    const newOptions = [...localOptions];
    const option = newOptions[optionIndex];
    
    if (!option.choices) {
      option.choices = [];
    }
    
    option.choices.push({ name: "", value: option.type === 'integer' ? 0 : "" });
    updateOptions(newOptions);
  };

  // 選択肢を削除
  const removeChoice = (optionIndex: number, choiceIndex: number) => {
    const newOptions = [...localOptions];
    const option = newOptions[optionIndex];
    
    if (option.choices) {
      option.choices = option.choices.filter((_, i) => i !== choiceIndex);
      updateOptions(newOptions);
    }
  };

  // 選択肢を更新
  const updateChoice = (optionIndex: number, choiceIndex: number, key: 'name' | 'value', value: string | number) => {
    const newOptions = [...localOptions];
    const option = newOptions[optionIndex];
    
    if (option.choices && option.choices[choiceIndex]) {
      option.choices[choiceIndex] = { 
        ...option.choices[choiceIndex], 
        [key]: key === 'value' && option.type === 'integer' ? parseInt(value as string) || 0 : value 
      };
      updateOptions(newOptions);
    }
  };

  // アコーディオンの開閉状態を管理
  const handleAccordionChange = (value: string) => {
    setOpenItems(
      openItems.includes(value)
        ? openItems.filter(item => item !== value)
        : [...openItems, value]
    );
  };

  return (
    <div className="space-y-4">
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
        <Accordion
          type="multiple"
          value={openItems}
          className="space-y-2"
        >
          {localOptions.map((option, index) => (
            <AccordionItem
              key={index}
              value={`option-${index}`}
              className="border rounded-md overflow-hidden"
            >
              <div className="flex items-center border-b">
                <div className="flex-1">
                  <AccordionTrigger
                    onClick={() => handleAccordionChange(`option-${index}`)}
                    className="px-4 py-3 hover:no-underline"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {option.name ? `/${option.name}` : `オプション ${index + 1}`}
                      </span>
                      {option.type && (
                        <Badge variant="outline" className="ml-2">
                          {optionTypeLabels[option.type]}
                        </Badge>
                      )}
                      {option.required && (
                        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                          必須
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                </div>
                <div className="flex items-center pr-4 space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveOptionUp(index);
                    }}
                    disabled={index === 0}
                    className="h-8 w-8"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveOptionDown(index);
                    }}
                    disabled={index === localOptions.length - 1}
                    className="h-8 w-8"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
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
              </div>
              
              <AccordionContent className="p-4 pt-2">
                {validationErrors[index.toString()] && validationErrors[index.toString()].length > 0 && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
                      <div>
                        <p className="font-medium text-red-500">エラー</p>
                        <ul className="text-sm text-red-500 list-disc list-inside">
                          {validationErrors[index.toString()].map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`option-name-${index}`}>名前</Label>
                      <Input
                        id={`option-name-${index}`}
                        value={option.name}
                        onChange={(e) => updateOption(index, 'name', e.target.value)}
                        placeholder="例: user"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`option-type-${index}`}>タイプ</Label>
                      <Select
                        value={option.type}
                        onValueChange={(value) => updateOption(index, 'type', value)}
                      >
                        <SelectTrigger id={`option-type-${index}`}>
                          <SelectValue placeholder="タイプを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(optionTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`option-description-${index}`}>説明</Label>
                    <Input
                      id={`option-description-${index}`}
                      value={option.description}
                      onChange={(e) => updateOption(index, 'description', e.target.value)}
                      placeholder="例: BANするユーザー"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`option-required-${index}`}
                      checked={option.required}
                      onCheckedChange={(checked: boolean | 'indeterminate') => 
                        updateOption(index, 'required', checked === true)
                      }
                    />
                    <Label htmlFor={`option-required-${index}`}>必須オプション</Label>
                  </div>
                  
                  {/* 選択肢セクション (文字列または数値タイプの場合のみ表示) */}
                  {(option.type === 'string' || option.type === 'integer') && (
                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between items-center">
                        <Label>選択肢</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addChoice(index)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          選択肢を追加
                        </Button>
                      </div>
                      
                      {(!option.choices || option.choices.length === 0) ? (
                        <p className="text-sm text-muted-foreground">
                          選択肢を追加すると、ユーザーは定義された選択肢からのみ選択できるようになります。
                        </p>
                      ) : (
                        <div className="space-y-2 border rounded-md p-3">
                          {option.choices.map((choice, choiceIndex) => (
                            <div key={choiceIndex} className="flex items-center space-x-2">
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <Input
                                  value={choice.name}
                                  onChange={(e) => updateChoice(index, choiceIndex, 'name', e.target.value)}
                                  placeholder="表示名"
                                  size={1}
                                />
                                <Input
                                  value={choice.value}
                                  onChange={(e) => updateChoice(index, choiceIndex, 'value', e.target.value)}
                                  placeholder="値"
                                  type={option.type === 'integer' ? 'number' : 'text'}
                                  size={1}
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeChoice(index, choiceIndex)}
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
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
