/**
 * Command Wizard Component
 * Created: 2025/3/14
 * Updated: 2025/3/14 - API連携をオプション設定の前に配置するように変更
 * Updated: 2025/3/15 - 使用範囲をアウトプット先に変更
 * Updated: 2025/3/15 - コンポーネントをリファクタリングし、各ステップを別ファイルに分割
 * 
 * このコンポーネントは、Discordボットコマンドの作成・編集をステップバイステップで
 * ガイドするウィザードインターフェースを提供します。
 */

"use client"

import { useState, useEffect } from "react"
import { 
  ChevronRight, 
  ChevronLeft,
  Terminal,
  ListPlus,
  MessageSquare,
  Braces,
  Bot,
  Check
} from "lucide-react"
import { Command, CommandOption, CommandOutputDestination } from "@/types/command"
import { Button } from "@/components/ui/button"
import { ApiConfig, ApiService } from "@/types/api-config"
import { WizardStep, CommandWizardProps, createEmptyCommand, stepInfo } from "./command-wizard-types"

// 各ステップのコンポーネントをインポート
import { BasicStep } from "./command-wizard-steps/basic-step"
import { ApiStep } from "./command-wizard-steps/api-step"
import { ApiFlowStep } from "./command-wizard-steps/api-flow-step"
import { OptionsStep } from "./command-wizard-steps/options-step"
import { OutputStep } from "./command-wizard-steps/output-step"
import { PromptStep } from "./command-wizard-steps/prompt-step"
import { ReviewStep } from "./command-wizard-steps/review-step"

export function CommandWizard({
  bots,
  initialCommand,
  initialApiConfig,
  initialPromptContent,
  onSave,
  onCancel
}: CommandWizardProps) {
  // 現在のステップ
  const [currentStep, setCurrentStep] = useState<WizardStep>("basic");
  
  // コマンド情報
  const [command, setCommand] = useState<Partial<Command>>(
    initialCommand || createEmptyCommand()
  );
  
  // プロンプト情報
  const [promptContent, setPromptContent] = useState<string>(initialPromptContent || "");
  const [promptVariables, setPromptVariables] = useState<string[]>([]);
  
  // API連携情報
  const [apiConfig, setApiConfig] = useState<ApiConfig | null>(initialApiConfig || null);
  
  // バリデーションエラー
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 初期プロンプトから変数を抽出
  useEffect(() => {
    if (initialPromptContent) {
      // 正規表現で {variable} 形式の変数を抽出
      const matches = initialPromptContent.match(/\{([^}]+)\}/g) || [];
      const extractedVariables = matches.map(match => match.slice(1, -1));
      setPromptVariables(extractedVariables);
    }
  }, [initialPromptContent]);

  // コマンド情報の更新
  const updateCommand = (updates: Partial<Command>) => {
    // 現在の状態と比較して、変更がある場合のみ更新
    if (JSON.stringify(updates) !== JSON.stringify(command)) {
      setCommand(prevCommand => ({
        ...prevCommand,
        ...updates
      }));
    }
  };

  // API設定の更新
  const updateApiConfig = (config: ApiConfig) => {
    // 現在の状態と比較して、変更がある場合のみ更新
    if (JSON.stringify(config) !== JSON.stringify(apiConfig)) {
      setApiConfig(config);
    }
  };

  // プロンプトの更新
  const updatePrompt = (content: string, variables: string[]) => {
    // 現在の状態と比較して、変更がある場合のみ更新
    if (content !== promptContent || JSON.stringify(variables) !== JSON.stringify(promptVariables)) {
      setPromptContent(content);
      setPromptVariables(variables);
    }
  };

  // 現在のステップのバリデーション
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case "basic":
        if (!command.botId) {
          newErrors.botId = "ボットを選択してください";
        }
        if (!command.name) {
          newErrors.name = "コマンド名を入力してください";
        } else if (!/^[a-z0-9_-]+$/.test(command.name)) {
          newErrors.name = "コマンド名は小文字の英数字、アンダースコア、ハイフンのみ使用できます";
        }
        if (!command.description) {
          newErrors.description = "説明を入力してください";
        }
        break;
      
      // 他のステップのバリデーションは必要に応じて追加
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 次のステップに進む
  const goToNextStep = () => {
    // 現在のステップのバリデーション
    if (!validateCurrentStep()) {
      return;
    }
    
    // 次のステップに進む
    switch (currentStep) {
      case "basic":
        setCurrentStep("api");
        break;
      case "api":
        // APIフローが設定されている場合はAPIフローステップへ
        if (command.apiFlow && command.apiFlow.length > 0) {
          setCurrentStep("api-flow");
        } else {
          setCurrentStep("options");
        }
        break;
      case "api-flow":
        setCurrentStep("options");
        break;
      case "options":
        setCurrentStep("output");
        break;
      case "output":
        setCurrentStep("prompt");
        break;
      case "prompt":
        setCurrentStep("review");
        break;
      case "review":
        handleSave();
        break;
    }
  };

  // テンプレートからコマンドが作成された場合、APIフローが設定されていれば自動的にAPIフローステップに進む
  useEffect(() => {
    if (initialCommand?.apiFlow && initialCommand.apiFlow.length > 0 && currentStep === "api") {
      setCurrentStep("api-flow");
    }
  }, [initialCommand, currentStep]);

  // 前のステップに戻る
  const goToPreviousStep = () => {
    switch (currentStep) {
      case "api":
        setCurrentStep("basic");
        break;
      case "api-flow":
        setCurrentStep("api");
        break;
      case "options":
        if (command.apiFlow && command.apiFlow.length > 0) {
          setCurrentStep("api-flow");
        } else {
          setCurrentStep("api");
        }
        break;
      case "output":
        setCurrentStep("options");
        break;
      case "prompt":
        setCurrentStep("output");
        break;
      case "review":
        setCurrentStep("prompt");
        break;
    }
  };

  // 保存処理
  const handleSave = () => {
    // プロンプトとAPI連携の情報を含めたコマンドオブジェクトを作成
    const finalCommand = {
      ...command,
      prompt: promptContent ? {
        content: promptContent,
        variables: promptVariables,
        apiIntegration: apiConfig?.service !== "none" ? apiConfig?.service as string : null
      } : undefined
    };
    
    onSave(finalCommand);
  };

  // アイコンの取得
  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case "Terminal":
        return <Terminal className="h-5 w-5" />;
      case "Braces":
        return <Braces className="h-5 w-5" />;
      case "ListPlus":
        return <ListPlus className="h-5 w-5" />;
      case "Bot":
        return <Bot className="h-5 w-5" />;
      case "MessageSquare":
        return <MessageSquare className="h-5 w-5" />;
      case "Check":
        return <Check className="h-5 w-5" />;
      default:
        return null;
    }
  };

  // 現在のステップに応じたコンポーネントを表示
  const renderStepContent = () => {
    const stepProps = {
      command,
      updateCommand,
      errors,
      apiConfig,
      updateApiConfig,
      promptContent,
      promptVariables,
      updatePrompt,
      bots
    };

    switch (currentStep) {
      case "basic":
        return <BasicStep {...stepProps} />;
      case "api":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">API連携設定</h3>
              <Button 
                variant="default" 
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium"
                onClick={() => setCurrentStep("api-flow")}
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3v12"></path>
                    <circle cx="18" cy="6" r="3"></circle>
                    <circle cx="6" cy="18" r="3"></circle>
                    <path d="M18 9a9 9 0 0 1-9 9"></path>
                  </svg>
                  複数API連携フローを設定
                </span>
              </Button>
            </div>
            <ApiStep {...stepProps} />
          </div>
        );
      case "api-flow":
        return <ApiFlowStep {...stepProps} />;
      case "options":
        return <OptionsStep {...stepProps} />;
      case "output":
        return <OutputStep {...stepProps} />;
      case "prompt":
        return <PromptStep {...stepProps} />;
      case "review":
        return <ReviewStep {...stepProps} />;
      default:
        return null;
    }
  };

  // ステップナビゲーションの表示
  const renderStepNavigation = () => {
    // api-flowステップはナビゲーションには表示しない（apiステップの一部として扱う）
    const steps: WizardStep[] = ["basic", "api", "options", "output", "prompt", "review"];
    // 現在のステップがapi-flowの場合は、apiのインデックスを使用
    const currentIndex = currentStep === "api-flow" 
      ? steps.indexOf("api") 
      : steps.indexOf(currentStep);

    return (
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index <= currentIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-1 ${
                    index < currentIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {getStepIcon(stepInfo[currentStep].iconName)}
          <div>
            <div className="text-lg font-medium">{stepInfo[currentStep].title}</div>
            <div className="text-sm text-muted-foreground">{stepInfo[currentStep].description}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderStepNavigation()}
      
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>
      
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={currentStep === "basic" ? onCancel : goToPreviousStep}
        >
          {currentStep === "basic" ? "キャンセル" : (
            <>
              <ChevronLeft className="mr-2 h-4 w-4" />
              戻る
            </>
          )}
        </Button>
        
        <Button onClick={goToNextStep}>
          {currentStep === "review" ? "保存" : (
            <>
              次へ
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
