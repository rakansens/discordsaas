"use client";

/**
 * API Flow Builder Component
 * Created: 2025/3/15
 * 
 * このコンポーネントは、複数のAPIサービスを連携させるフローを構築するための
 * ビジュアルインターフェースを提供します。
 */

import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  PlusCircle, 
  ArrowDown, 
  X, 
  MoveUp, 
  MoveDown,
  Settings
} from "lucide-react";
import { ApiConfig, ApiService } from "@/types/api-config";
import { apiServiceInfo } from "@/constants/api-services";
import { ApiIntegrationPanel } from "./api-integration-panel";

// APIフローのステップ型定義
export interface ApiFlowStep {
  id: string;
  service: ApiService;
  config: ApiConfig;
  name: string;
  description: string;
}

interface ApiFlowBuilderProps {
  initialSteps?: ApiFlowStep[];
  onChange: (steps: ApiFlowStep[]) => void;
}

export function ApiFlowBuilder({
  initialSteps = [],
  onChange
}: ApiFlowBuilderProps) {
  // APIフローのステップ
  const [steps, setSteps] = useState<ApiFlowStep[]>(initialSteps.length > 0 ? initialSteps : []);
  
  // 現在編集中のステップのインデックス
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);

  // 変更を親コンポーネントに通知
  useEffect(() => {
    onChange(steps);
  }, [steps, onChange]);

  // 新しいステップを追加
  const addStep = () => {
    const currentLength = steps.length;
    const newStep: ApiFlowStep = {
      id: `step-${Date.now()}`,
      service: "none",
      config: {
        service: "none",
        settings: {}
      },
      name: `ステップ ${currentLength + 1}`,
      description: ""
    };
    
    setSteps(prevSteps => [...prevSteps, newStep]);
    setEditingStepIndex(currentLength); // 新しく追加したステップを編集モードに
  };

  // ステップを削除
  const removeStep = (index: number) => {
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      newSteps.splice(index, 1);
      return newSteps;
    });
    
    // 編集中のステップが削除された場合、編集モードを解除
    if (editingStepIndex === index) {
      setEditingStepIndex(null);
    } else if (editingStepIndex !== null && editingStepIndex > index) {
      // 削除されたステップより後ろのステップを編集中だった場合、インデックスを調整
      setEditingStepIndex(editingStepIndex - 1);
    }
  };

  // ステップを上に移動
  const moveStepUp = (index: number) => {
    if (index === 0) return;
    
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      const temp = newSteps[index];
      newSteps[index] = newSteps[index - 1];
      newSteps[index - 1] = temp;
      return newSteps;
    });
    
    // 編集中のステップが移動した場合、編集中のインデックスも更新
    if (editingStepIndex === index) {
      setEditingStepIndex(index - 1);
    } else if (editingStepIndex === index - 1) {
      setEditingStepIndex(index);
    }
  };

  // ステップを下に移動
  const moveStepDown = (index: number) => {
    if (index === steps.length - 1) return;
    
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      const temp = newSteps[index];
      newSteps[index] = newSteps[index + 1];
      newSteps[index + 1] = temp;
      return newSteps;
    });
    
    // 編集中のステップが移動した場合、編集中のインデックスも更新
    if (editingStepIndex === index) {
      setEditingStepIndex(index + 1);
    } else if (editingStepIndex === index + 1) {
      setEditingStepIndex(index);
    }
  };

  // ステップのサービスを変更
  const updateStepService = (index: number, service: ApiService) => {
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      newSteps[index] = {
        ...newSteps[index],
        service,
        config: {
          ...newSteps[index].config,
          service
        }
      };
      return newSteps;
    });
  };

  // ステップの名前を変更
  const updateStepName = (index: number, name: string) => {
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      newSteps[index] = {
        ...newSteps[index],
        name
      };
      return newSteps;
    });
  };

  // ステップの説明を変更
  const updateStepDescription = (index: number, description: string) => {
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      newSteps[index] = {
        ...newSteps[index],
        description
      };
      return newSteps;
    });
  };

  // ステップのAPI設定を更新
  const updateStepConfig = (index: number, config: ApiConfig) => {
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      newSteps[index] = {
        ...newSteps[index],
        config
      };
      return newSteps;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">APIフロービルダー</h3>
        <Button onClick={addStep} variant="outline" size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          ステップを追加
        </Button>
      </div>
      
      {steps.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/50">
          <p className="text-muted-foreground mb-4">APIフローが設定されていません</p>
          <Button onClick={addStep} variant="outline">
            <PlusCircle className="h-4 w-4 mr-2" />
            最初のステップを追加
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={step.id} className="space-y-2">
              <Card className={editingStepIndex === index ? "border-primary" : ""}>
                <CardHeader className="p-4 pb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                          {index + 1}
                        </div>
                        {editingStepIndex === index ? (
                          <Input
                            value={step.name}
                            onChange={(e) => updateStepName(index, e.target.value)}
                            className="h-7 text-base font-medium"
                          />
                        ) : (
                          <CardTitle className="text-base">{step.name}</CardTitle>
                        )}
                      </div>
                      {editingStepIndex === index ? (
                        <Input
                          value={step.description}
                          onChange={(e) => updateStepDescription(index, e.target.value)}
                          className="h-7 mt-1 text-sm"
                          placeholder="ステップの説明（任意）"
                        />
                      ) : (
                        step.description && (
                          <CardDescription className="mt-1">{step.description}</CardDescription>
                        )
                      )}
                    </div>
                    <div className="flex space-x-1">
                      {editingStepIndex !== index ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingStepIndex(index)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingStepIndex(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveStepUp(index)}
                        disabled={index === 0}
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveStepDown(index)}
                        disabled={index === steps.length - 1}
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStep(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {editingStepIndex === index ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`step-${index}-service`}>APIサービス</Label>
                        <Select
                          value={step.service}
                          onValueChange={(value: ApiService) => updateStepService(index, value)}
                        >
                          <SelectTrigger id={`step-${index}-service`}>
                            <SelectValue placeholder="APIサービスを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(apiServiceInfo).map(([key, info]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center">
                                  <span className="mr-2">{info.icon}</span>
                                  <span>{info.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {step.service !== "none" && (
                        <ApiIntegrationPanel
                          apiConfig={step.config}
                          onChange={(config) => updateStepConfig(index, config)}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {apiServiceInfo[step.service].icon}
                          <span className="ml-2">{apiServiceInfo[step.service].name}</span>
                        </div>
                        {step.service !== "none" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingStepIndex(index)}
                          >
                            設定を編集
                          </Button>
                        )}
                      </div>
                      
                      {/* 設定内容のプレビュー表示 */}
                      {step.service !== "none" && (
                        <div className="bg-muted/30 p-3 rounded-md text-sm">
                          <h4 className="font-medium mb-2">設定内容:</h4>
                          <div className="space-y-1">
                            {step.config.settings && step.service in step.config.settings && step.config.settings[step.service] ? (
                              <>
                                {Object.entries(step.config.settings[step.service] as Record<string, any>).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="text-muted-foreground">{key}:</span>
                                    <span className="font-mono">
                                      {typeof value === 'object' 
                                        ? JSON.stringify(value).substring(0, 30) + (JSON.stringify(value).length > 30 ? '...' : '')
                                        : String(value).substring(0, 30) + (String(value).length > 30 ? '...' : '')}
                                    </span>
                                  </div>
                                ))}
                                {step.config.settings[step.service] && Object.keys(step.config.settings[step.service] as Record<string, any>).length === 0 && (
                                  <span className="text-muted-foreground italic">デフォルト設定</span>
                                )}
                              </>
                            ) : (
                              <span className="text-muted-foreground italic">デフォルト設定</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {index < steps.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
