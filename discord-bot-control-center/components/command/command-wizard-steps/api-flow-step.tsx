/**
 * API Flow Step Component
 * Created: 2025/3/15
 * 
 * このコンポーネントは、コマンドウィザードのAPIフロー設定ステップを表示します。
 * 複数のAPIサービスを連携させるフローを構築することができます。
 */

import { useState, useEffect } from "react";
import { StepProps } from "../command-wizard-types";
import { ApiFlowBuilder } from "../api-flow-builder";
import type { ApiFlowStep } from "../api-flow-builder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiIntegrationPanel } from "../api-integration-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export function ApiFlowStep({
  command,
  updateCommand,
  apiConfig,
  updateApiConfig
}: StepProps) {
  // APIフローのステップ
  const [apiFlowSteps, setApiFlowSteps] = useState<ApiFlowStep[]>(command.apiFlow || []);
  
  // 単一APIか複数APIフローか
  const [apiMode, setApiMode] = useState<"single" | "flow">(
    command.apiFlow && command.apiFlow.length > 0 ? "flow" : "single"
  );

  // APIフローが変更されたときにコマンド情報を更新
  useEffect(() => {
    // commandの参照を保持して比較（依存配列から除外するため、ここで取得）
    const currentApiFlow = command.apiFlow;
    const currentCommand = command;
    
    // 現在の状態と異なる場合のみ更新
    if (apiMode === "flow" && JSON.stringify(currentApiFlow) !== JSON.stringify(apiFlowSteps)) {
      updateCommand({
        ...currentCommand,
        apiFlow: apiFlowSteps
      });
    } else if (apiMode === "single" && currentApiFlow !== undefined) {
      // 単一APIモードの場合はapiFlowをクリア
      updateCommand({
        ...currentCommand,
        apiFlow: undefined
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiFlowSteps, apiMode, updateCommand]);

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue={apiMode}
        onValueChange={(value) => setApiMode(value as "single" | "flow")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">単一API連携</TabsTrigger>
          <TabsTrigger value="flow">複数API連携フロー</TabsTrigger>
        </TabsList>
        
        <TabsContent value="single" className="pt-4">
          <ApiIntegrationPanel
            apiConfig={apiConfig || { service: "none", settings: {} }}
            onChange={updateApiConfig}
          />
        </TabsContent>
        
        <TabsContent value="flow" className="pt-4">
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex items-start">
                <Info className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">複数API連携フロー</CardTitle>
                  <CardDescription>
                    複数のAPIサービスを連携させて、データの流れを定義します。
                    各ステップは前のステップの出力を入力として受け取ります。
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <p>
                  <strong>例1:</strong> 音声認識（Whisper）→ ChatGPTによる要約 → アウトプット
                </p>
                <p>
                  <strong>例2:</strong> リンクの要約 → Claude 3.7 Sonnetによる図解化
                </p>
                <p>
                  <strong>例3:</strong> 検索（Perplexity API）→ 図解化
                </p>
              </div>
            </CardContent>
          </Card>
          
          <ApiFlowBuilder
            initialSteps={apiFlowSteps}
            onChange={setApiFlowSteps}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
