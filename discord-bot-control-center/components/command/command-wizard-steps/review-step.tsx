/**
 * Review Step Component
 * Created: 2025/3/15
 * 
 * このコンポーネントは、コマンドウィザードの確認・保存ステップを表示します。
 * 設定内容を確認して保存できます。
 */

import { StepProps } from "../command-wizard-types"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ReviewStep({
  command,
  apiConfig,
  bots
}: StepProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium">ボット:</dt>
              <dd>{bots.find(b => b.id === command.botId)?.name || "未選択"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">コマンド名:</dt>
              <dd>/{command.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">説明:</dt>
              <dd>{command.description}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">使用方法:</dt>
              <dd>{command.usage}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">API連携</CardTitle>
        </CardHeader>
        <CardContent>
          {command.apiFlow && command.apiFlow.length > 0 ? (
            <div>
              <p className="font-medium mb-2">複数API連携フロー:</p>
              <ul className="space-y-2">
                {command.apiFlow.map((step, index) => (
                  <li key={index} className="flex items-center">
                    <Badge className="mr-2">{index + 1}</Badge>
                    <span>{step.name} ({step.service})</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : apiConfig && apiConfig.service !== "none" ? (
            <div>
              <p>
                <span className="font-medium">サービス:</span> {apiConfig.service}
              </p>
              {/* APIサービスごとの設定詳細を表示 */}
            </div>
          ) : (
            <p className="text-muted-foreground">API連携はありません</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">アウトプット先</CardTitle>
        </CardHeader>
        <CardContent>
          {command.outputDestination ? (
            <div>
              <p>
                <span className="font-medium">設定タイプ:</span>{" "}
                {command.outputDestination.type === "global" 
                  ? "グローバル（制限なし）" 
                  : command.outputDestination.type === "servers" 
                    ? "特定のサーバーのみ" 
                    : command.outputDestination.type === "channel" 
                      ? "特定のチャンネルのみ" 
                      : command.outputDestination.type === "threads"
                        ? "特定のスレッドのみ"
                        : command.outputDestination.type === "thread"
                          ? "スレッドのみ"
                          : command.outputDestination.type === "dm"
                            ? "DMのみ"
                            : "一時メッセージ（本人のみ表示）"}
              </p>
              
              {command.outputDestination.type === "servers" && command.outputDestination.allowedServers && (
                <div className="mt-2">
                  <p className="font-medium">指定されたサーバー:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {command.outputDestination.allowedServers.map((serverId, index) => (
                      <Badge key={index} variant="secondary">
                        {serverId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {command.outputDestination.type === "channel" && command.outputDestination.channelIds && (
                <div className="mt-2">
                  <p className="font-medium">指定されたチャンネル:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {command.outputDestination.channelIds.map((channelId, index) => (
                      <Badge key={index} variant="secondary">
                        {channelId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {command.outputDestination.type === "threads" && command.outputDestination.allowedThreads && (
                <div className="mt-2">
                  <p className="font-medium">指定されたスレッド:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {command.outputDestination.allowedThreads.map((threadId, index) => (
                      <Badge key={index} variant="secondary">
                        {threadId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">グローバル（制限なし）</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">オプション</CardTitle>
        </CardHeader>
        <CardContent>
          {command.options && command.options.length > 0 ? (
            <ul className="space-y-2">
              {command.options.map((option, index) => (
                <li key={index} className="flex justify-between">
                  <div>
                    <span className="font-medium">{option.name}</span>
                    {option.required && <span className="text-red-500 ml-1">*</span>}
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <div className="text-sm">
                    <Badge variant="outline">{option.type}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">オプションはありません</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
