/**
 * Output Step Component
 * Created: 2025/3/15
 * 
 * このコンポーネントは、コマンドウィザードのアウトプット先設定ステップを表示します。
 * コマンドの出力先（サーバー、チャンネル、スレッド）を設定できます。
 */

import { CommandOutputDestination } from "@/types/command"
import { StepProps } from "../command-wizard-types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

export function OutputStep({
  command,
  updateCommand
}: StepProps) {
  // アウトプット先の更新
  const updateOutputDestination = (outputDestination: CommandOutputDestination) => {
    updateCommand({
      outputDestination
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="output-type">アウトプット先の設定</Label>
          <Select
            value={command.outputDestination?.type || "global"}
            onValueChange={(value) => {
              const outputType = value as CommandOutputDestination["type"];
              let newOutputDestination: CommandOutputDestination;
              
              switch (outputType) {
                case "servers":
                  newOutputDestination = { type: "servers", allowedServers: [] };
                  break;
                case "channels":
                  newOutputDestination = { type: "channels", allowedChannels: [] };
                  break;
                case "threads":
                  newOutputDestination = { type: "threads", allowedThreads: [] };
                  break;
                default:
                  newOutputDestination = { type: "global" };
              }
              
              updateOutputDestination(newOutputDestination);
            }}
          >
            <SelectTrigger id="output-type">
              <SelectValue placeholder="アウトプット先を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">グローバル（制限なし）</SelectItem>
              <SelectItem value="servers">特定のサーバーのみ</SelectItem>
              <SelectItem value="channels">特定のチャンネルのみ</SelectItem>
              <SelectItem value="threads">特定のスレッドのみ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {command.outputDestination?.type === "servers" && (
          <div className="space-y-2">
            <Label>指定するサーバー</Label>
            <div className="space-y-2">
              {command.outputDestination.allowedServers && command.outputDestination.allowedServers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {command.outputDestination.allowedServers.map((serverId, index) => (
                    <Badge key={index} className="flex items-center gap-1">
                      {serverId}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0"
                        onClick={() => {
                          const newAllowedServers = [...command.outputDestination!.allowedServers!];
                          newAllowedServers.splice(index, 1);
                          updateOutputDestination({
                            ...command.outputDestination!,
                            allowedServers: newAllowedServers
                          });
                        }}
                      >
                        <span className="sr-only">削除</span>
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">サーバーが追加されていません</p>
              )}
              
              <div className="flex gap-2">
                <Input
                  id="server-id"
                  placeholder="サーバーID（例: 123456789012345678）"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      const newServerId = e.currentTarget.value;
                      updateOutputDestination({
                        ...command.outputDestination!,
                        allowedServers: [...(command.outputDestination!.allowedServers || []), newServerId]
                      });
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.getElementById("server-id") as HTMLInputElement;
                    if (input.value) {
                      const newServerId = input.value;
                      updateOutputDestination({
                        ...command.outputDestination!,
                        allowedServers: [...(command.outputDestination!.allowedServers || []), newServerId]
                      });
                      input.value = "";
                    }
                  }}
                >
                  追加
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {command.outputDestination?.type === "channels" && (
          <div className="space-y-2">
            <Label>指定するチャンネル</Label>
            <div className="space-y-2">
              {command.outputDestination.allowedChannels && command.outputDestination.allowedChannels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {command.outputDestination.allowedChannels.map((channelId, index) => (
                    <Badge key={index} className="flex items-center gap-1">
                      {channelId}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0"
                        onClick={() => {
                          const newAllowedChannels = [...command.outputDestination!.allowedChannels!];
                          newAllowedChannels.splice(index, 1);
                          updateOutputDestination({
                            ...command.outputDestination!,
                            allowedChannels: newAllowedChannels
                          });
                        }}
                      >
                        <span className="sr-only">削除</span>
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">チャンネルが追加されていません</p>
              )}
              
              <div className="flex gap-2">
                <Input
                  id="channel-id"
                  placeholder="チャンネルID（例: 123456789012345678）"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      const newChannelId = e.currentTarget.value;
                      updateOutputDestination({
                        ...command.outputDestination!,
                        allowedChannels: [...(command.outputDestination!.allowedChannels || []), newChannelId]
                      });
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.getElementById("channel-id") as HTMLInputElement;
                    if (input.value) {
                      const newChannelId = input.value;
                      updateOutputDestination({
                        ...command.outputDestination!,
                        allowedChannels: [...(command.outputDestination!.allowedChannels || []), newChannelId]
                      });
                      input.value = "";
                    }
                  }}
                >
                  追加
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {command.outputDestination?.type === "threads" && (
          <div className="space-y-2">
            <Label>指定するスレッド</Label>
            <div className="space-y-2">
              {command.outputDestination.allowedThreads && command.outputDestination.allowedThreads.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {command.outputDestination.allowedThreads.map((threadId, index) => (
                    <Badge key={index} className="flex items-center gap-1">
                      {threadId}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0"
                        onClick={() => {
                          const newAllowedThreads = [...command.outputDestination!.allowedThreads!];
                          newAllowedThreads.splice(index, 1);
                          updateOutputDestination({
                            ...command.outputDestination!,
                            allowedThreads: newAllowedThreads
                          });
                        }}
                      >
                        <span className="sr-only">削除</span>
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">スレッドが追加されていません</p>
              )}
              
              <div className="flex gap-2">
                <Input
                  id="thread-id"
                  placeholder="スレッドID（例: 123456789012345678）"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      const newThreadId = e.currentTarget.value;
                      updateOutputDestination({
                        ...command.outputDestination!,
                        allowedThreads: [...(command.outputDestination!.allowedThreads || []), newThreadId]
                      });
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.getElementById("thread-id") as HTMLInputElement;
                    if (input.value) {
                      const newThreadId = input.value;
                      updateOutputDestination({
                        ...command.outputDestination!,
                        allowedThreads: [...(command.outputDestination!.allowedThreads || []), newThreadId]
                      });
                      input.value = "";
                    }
                  }}
                >
                  追加
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="pt-4">
          <p className="text-sm text-muted-foreground">
            <strong>ヒント:</strong> サーバー、チャンネル、スレッドのIDは、Discordの開発者モードを有効にして、
            対象を右クリックして「IDをコピー」を選択することで取得できます。
          </p>
        </div>
      </div>
    </div>
  );
}
