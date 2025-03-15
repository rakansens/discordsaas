/**
 * Prompt Template Editor Component
 * Created: 2025/3/14
 * 
 * このコンポーネントは、プロンプトテンプレートの編集と変数の挿入を支援するためのインターフェースを提供します。
 */

"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Braces, 
  Plus, 
  Trash2, 
  AlertCircle,
  Info,
  Copy
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

interface PromptTemplateEditorProps {
  content: string;
  variables: string[];
  onChange: (content: string, variables: string[]) => void;
  commandOptions?: { name: string; description: string }[];
}

export function PromptTemplateEditor({
  content = "",
  variables = [],
  onChange,
  commandOptions = []
}: PromptTemplateEditorProps) {
  const [localContent, setLocalContent] = useState(content);
  const [localVariables, setLocalVariables] = useState<string[]>(variables);
  const [newVariable, setNewVariable] = useState("");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 親コンポーネントからのプロパティが変更された場合に内部状態を更新
  useEffect(() => {
    setLocalContent(content);
    setLocalVariables(variables);
  }, [content, variables]);

  // 内部状態が変更されたときに親コンポーネントに通知
  useEffect(() => {
    onChange(localContent, localVariables);
  }, [localContent, localVariables, onChange]);

  // プロンプト内容を更新
  const updateContent = (newContent: string) => {
    setLocalContent(newContent);
    
    // プロンプト内の変数を検出
    const detectedVariables = extractVariablesFromContent(newContent);
    
    // 既存の変数と検出された変数をマージ
    const mergedVariables = Array.from(new Set([...localVariables, ...detectedVariables]));
    
    // 使用されていない変数を削除
    const usedVariables = mergedVariables.filter(variable => 
      newContent.includes(`{${variable}}`)
    );
    
    setLocalVariables(usedVariables);
  };

  // プロンプト内の変数を抽出
  const extractVariablesFromContent = (text: string): string[] => {
    const regex = /{([^{}]+)}/g;
    const matches = text.match(regex) || [];
    return matches.map(match => match.slice(1, -1));
  };

  // 新しい変数を追加
  const addVariable = () => {
    if (!newVariable.trim()) {
      setError("変数名を入力してください");
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(newVariable)) {
      setError("変数名には英数字とアンダースコアのみ使用できます");
      return;
    }
    
    if (localVariables.includes(newVariable)) {
      setError("この変数名は既に存在します");
      return;
    }
    
    setLocalVariables([...localVariables, newVariable]);
    setNewVariable("");
    setError(null);
  };

  // 変数を削除
  const removeVariable = (variable: string) => {
    setLocalVariables(localVariables.filter(v => v !== variable));
  };

  // 変数をプロンプトに挿入
  const insertVariable = (variable: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newContent = 
      localContent.substring(0, start) + 
      `{${variable}}` + 
      localContent.substring(end);
    
    setLocalContent(newContent);
    
    // 変数リストに追加（まだ存在しない場合）
    if (!localVariables.includes(variable)) {
      setLocalVariables([...localVariables, variable]);
    }
    
    // カーソル位置を更新
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + variable.length + 2;
      textarea.selectionEnd = start + variable.length + 2;
    }, 0);
  };

  // コマンドオプションから変数を追加
  const addVariableFromOption = (optionName: string) => {
    if (!localVariables.includes(optionName)) {
      setLocalVariables([...localVariables, optionName]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="prompt-content">プロンプトテンプレート</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>
                  変数は {'{variable}'} の形式で指定します。変数はユーザー入力やコマンドオプションの値に置き換えられます。
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          id="prompt-content"
          ref={textareaRef}
          value={localContent}
          onChange={(e) => updateContent(e.target.value)}
          placeholder="例: ユーザー {user} を {reason} の理由でBANしました。"
          rows={6}
          className="font-mono"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>変数</Label>
          <div className="flex space-x-2">
            <Input
              value={newVariable}
              onChange={(e) => setNewVariable(e.target.value)}
              placeholder="新しい変数名"
              className="w-40"
            />
            <Button
              onClick={addVariable}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              追加
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          </div>
        )}

        {localVariables.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {localVariables.map((variable) => (
              <Badge
                key={variable}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1"
              >
                <Braces className="h-3 w-3" />
                {variable}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVariable(variable)}
                  className="h-4 w-4 ml-1 text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => insertVariable(variable)}
                  className="h-4 w-4 text-muted-foreground hover:text-primary"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            変数がありません。プロンプト内で {'{変数名}'} の形式で変数を追加するか、下のコマンドオプションから変数を追加してください。
          </p>
        )}
      </div>

      {commandOptions && commandOptions.length > 0 && (
        <div className="space-y-2">
          <Label>コマンドオプションから変数を追加</Label>
          <Card>
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-2">
                {commandOptions.map((option) => (
                  <TooltipProvider key={option.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addVariableFromOption(option.name)}
                          className="h-8"
                        >
                          <Braces className="h-3 w-3 mr-1" />
                          {option.name}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{option.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-2">
        <Label>プレビュー</Label>
        <Card>
          <CardContent className="p-4 whitespace-pre-wrap">
            {localContent ? (
              <div className="text-sm">
                {localContent.split(/({[^{}]+})/).map((part, index) => {
                  if (part.match(/^{[^{}]+}$/)) {
                    const variable = part.slice(1, -1);
                    return (
                      <Badge key={index} variant="outline" className="mx-1 px-2 py-0.5">
                        {variable}
                      </Badge>
                    );
                  }
                  return <span key={index}>{part}</span>;
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                プロンプトを入力すると、ここにプレビューが表示されます。
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
