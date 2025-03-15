/**
 * Interactive Command Preview Component
 * Created: 2025/3/14
 * 
 * このコンポーネントは、Discordボットコマンドのインタラクティブなプレビューを提供します。
 * ユーザーがコマンドを入力する様子をシミュレーションし、オプションの選択肢や入力フォームを表示します。
 */

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Terminal, 
  Send, 
  User, 
  Hash, 
  ToggleLeft, 
  Type, 
  ListOrdered,
  ChevronDown,
  Check,
  X
} from "lucide-react"
import { CommandOption, CommandOptionType } from "@/types/command"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
// Popoverコンポーネントは使用していないため、インポートを削除

// オプションタイプのアイコンマッピング
const optionTypeIcons: Record<CommandOptionType, React.ReactNode> = {
  "string": <Type className="h-4 w-4" />,
  "integer": <ListOrdered className="h-4 w-4" />,
  "boolean": <ToggleLeft className="h-4 w-4" />,
  "user": <User className="h-4 w-4" />,
  "channel": <Hash className="h-4 w-4" />,
  "role": <User className="h-4 w-4" />,
  "mentionable": <User className="h-4 w-4" />
};

interface InteractiveCommandPreviewProps {
  commandName: string;
  options: CommandOption[];
}

export function InteractiveCommandPreview({ 
  commandName,
  options = []
}: InteractiveCommandPreviewProps) {
  // 入力中のコマンド
  const [inputCommand, setInputCommand] = useState<string>(`/${commandName}`);
  // 選択中のオプション
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(-1);
  // オプションの値
  const [optionValues, setOptionValues] = useState<Record<string, any>>({});
  // 送信済みコマンド
  const [sentCommand, setSentCommand] = useState<string | null>(null);
  // 送信済みオプション値
  const [sentOptionValues, setSentOptionValues] = useState<Record<string, any> | null>(null);
  // ボットの応答
  const [botResponse, setBotResponse] = useState<string | null>(null);

  // コマンド名が変更された場合に入力コマンドを更新
  useEffect(() => {
    setInputCommand(`/${commandName}`);
  }, [commandName]);

  // オプションが変更された場合にオプション値をリセット
  useEffect(() => {
    setOptionValues({});
    setSelectedOptionIndex(-1);
  }, [options]);

  // オプション値を更新
  const updateOptionValue = (optionName: string, value: any) => {
    setOptionValues({
      ...optionValues,
      [optionName]: value
    });
  };

  // 次のオプションを選択
  const selectNextOption = () => {
    if (selectedOptionIndex < options.length - 1) {
      setSelectedOptionIndex(selectedOptionIndex + 1);
    }
  };

  // コマンドを送信
  const sendCommand = () => {
    // 送信済みコマンドを設定
    setSentCommand(inputCommand);
    setSentOptionValues({...optionValues});
    
    // ボットの応答をシミュレーション
    setBotResponse(null);
    setTimeout(() => {
      setBotResponse("コマンドを実行しました。");
    }, 1000);
  };

  // コマンドをリセット
  const resetCommand = () => {
    setInputCommand(`/${commandName}`);
    setOptionValues({});
    setSelectedOptionIndex(-1);
    setSentCommand(null);
    setSentOptionValues(null);
    setBotResponse(null);
  };

  // 現在選択中のオプション
  const currentOption = selectedOptionIndex >= 0 ? options[selectedOptionIndex] : null;

  // オプション入力フォームをレンダリング
  const renderOptionInput = () => {
    if (!currentOption) return null;
    
    const optionName = currentOption.name;
    const optionValue = optionValues[optionName] || "";
    
    switch (currentOption.type) {
      case "string":
        return (
          <div className="flex items-center space-x-2">
            <Input
              value={optionValue}
              onChange={(e) => updateOptionValue(optionName, e.target.value)}
              placeholder={currentOption.description}
              className="flex-1"
            />
            <Button 
              size="sm" 
              onClick={selectNextOption}
              disabled={!optionValue && currentOption.required}
            >
              次へ
            </Button>
          </div>
        );
      
      case "integer":
        return (
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={optionValue}
              onChange={(e) => updateOptionValue(optionName, parseInt(e.target.value) || 0)}
              placeholder={currentOption.description}
              className="flex-1"
            />
            <Button 
              size="sm" 
              onClick={selectNextOption}
              disabled={optionValue === "" && currentOption.required}
            >
              次へ
            </Button>
          </div>
        );
      
      case "boolean":
        return (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`option-${optionName}-true`}
                checked={optionValue === true}
                onCheckedChange={() => updateOptionValue(optionName, true)}
              />
              <label htmlFor={`option-${optionName}-true`}>True</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`option-${optionName}-false`}
                checked={optionValue === false}
                onCheckedChange={() => updateOptionValue(optionName, false)}
              />
              <label htmlFor={`option-${optionName}-false`}>False</label>
            </div>
            <Button 
              size="sm" 
              onClick={selectNextOption}
              disabled={optionValue === "" && currentOption.required}
              className="ml-auto"
            >
              次へ
            </Button>
          </div>
        );
      
      case "user":
      case "channel":
      case "role":
      case "mentionable":
        return (
          <div className="flex items-center space-x-2">
            <Select
              value={optionValue}
              onValueChange={(value) => updateOptionValue(optionName, value)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={`${currentOption.description}を選択`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="example1">例: ユーザー1</SelectItem>
                <SelectItem value="example2">例: ユーザー2</SelectItem>
                <SelectItem value="example3">例: ユーザー3</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              onClick={selectNextOption}
              disabled={!optionValue && currentOption.required}
            >
              次へ
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  // 選択肢オプションの場合、選択肢を表示
  const renderChoices = () => {
    if (!currentOption || !currentOption.choices || currentOption.choices.length === 0) {
      return null;
    }
    
    return (
      <div className="mt-2">
        <p className="text-xs text-muted-foreground mb-1">選択肢:</p>
        <div className="flex flex-wrap gap-1">
          {currentOption.choices.map((choice, index) => (
            <Badge
              key={index}
              variant={optionValues[currentOption.name] === choice.value ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => updateOptionValue(currentOption.name, choice.value)}
            >
              {choice.name}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  // コマンドプレビューを生成
  const generateCommandPreview = () => {
    let preview = `/${commandName}`;
    
    Object.entries(optionValues).forEach(([name, value]) => {
      if (value !== undefined && value !== "") {
        preview += ` ${name}:${value}`;
      }
    });
    
    return preview;
  };

  return (
    <Card className="border-2 border-[#36393f] bg-[#36393f] text-white">
      <CardHeader className="bg-[#2f3136] border-b border-[#202225] pb-2">
        <div className="flex items-center">
          <Terminal className="h-5 w-5 mr-2 text-[#b9bbbe]" />
          <CardTitle className="text-lg text-[#ffffff]">Discordプレビュー</CardTitle>
        </div>
        <CardDescription className="text-[#b9bbbe]">
          コマンドの入力と実行をシミュレーション
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* チャット履歴 */}
        <div className="space-y-4 min-h-[100px]">
          {sentCommand && (
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center mr-3 flex-shrink-0">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center">
                  <span className="font-medium text-[#ffffff]">あなた</span>
                  <span className="text-xs text-[#b9bbbe] ml-2">今日 {new Date().getHours()}:{String(new Date().getMinutes()).padStart(2, '0')}</span>
                </div>
                <p className="text-[#dcddde] mt-1">
                  {sentCommand}
                  {sentOptionValues && Object.entries(sentOptionValues).map(([name, value]) => (
                    value !== undefined && value !== "" ? (
                      <span key={name} className="ml-1">
                        <Badge variant="outline" className="bg-[#4f545c] text-[#ffffff] border-[#4f545c]">
                          {name}: {value.toString()}
                        </Badge>
                      </span>
                    ) : null
                  ))}
                </p>
              </div>
            </div>
          )}
          
          {botResponse && (
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center mr-3 flex-shrink-0">
                <Terminal className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center">
                  <span className="font-medium text-[#ffffff]">ボット</span>
                  <span className="text-xs text-[#b9bbbe] ml-2">今日 {new Date().getHours()}:{String(new Date().getMinutes()).padStart(2, '0')}</span>
                </div>
                <p className="text-[#dcddde] mt-1">{botResponse}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* コマンド入力 */}
        <div className="relative">
          <Input
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            className="bg-[#40444b] border-[#40444b] text-[#dcddde] pr-10"
            placeholder="コマンドを入力..."
            disabled={selectedOptionIndex >= 0}
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1 h-8 w-8 text-[#b9bbbe] hover:text-[#dcddde] hover:bg-[#4f545c]"
            onClick={sendCommand}
            disabled={selectedOptionIndex >= 0 || !inputCommand}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* オプション入力 */}
        <AnimatePresence>
          {selectedOptionIndex >= 0 && currentOption && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-[#2f3136] p-3 rounded-md"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="text-[#ffffff] font-medium">{currentOption.name}</span>
                  {currentOption.required && (
                    <Badge className="ml-2 bg-[#ed4245] text-white border-[#ed4245]">
                      必須
                    </Badge>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-[#b9bbbe] hover:text-[#dcddde] hover:bg-[#4f545c]"
                  onClick={() => setSelectedOptionIndex(-1)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[#b9bbbe] text-sm mb-2">{currentOption.description}</p>
              {renderOptionInput()}
              {renderChoices()}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* オプションリスト */}
        {selectedOptionIndex === -1 && options.length > 0 && (
          <div className="bg-[#2f3136] p-3 rounded-md">
            <p className="text-[#ffffff] font-medium mb-2">利用可能なオプション:</p>
            <div className="grid grid-cols-2 gap-2">
              {options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`justify-start bg-[#4f545c] border-[#4f545c] text-[#ffffff] hover:bg-[#5d6269] hover:border-[#5d6269] ${
                    optionValues[option.name] !== undefined ? "border-[#5865f2]" : ""
                  }`}
                  onClick={() => setSelectedOptionIndex(index)}
                >
                  <div className="mr-2">
                    {optionTypeIcons[option.type]}
                  </div>
                  <span className="truncate">{option.name}</span>
                  {option.required && (
                    <span className="ml-1 text-[#ed4245]">*</span>
                  )}
                  {optionValues[option.name] !== undefined && (
                    <Check className="ml-auto h-4 w-4 text-[#5865f2]" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-[#2f3136] border-t border-[#202225] p-3 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={resetCommand}
          className="bg-[#4f545c] border-[#4f545c] text-[#ffffff] hover:bg-[#5d6269] hover:border-[#5d6269]"
        >
          リセット
        </Button>
        <Button
          size="sm"
          onClick={sendCommand}
          disabled={selectedOptionIndex >= 0}
          className="bg-[#5865f2] hover:bg-[#4752c4] text-white"
        >
          <Send className="mr-2 h-4 w-4" />
          送信
        </Button>
      </CardFooter>
    </Card>
  );
}
