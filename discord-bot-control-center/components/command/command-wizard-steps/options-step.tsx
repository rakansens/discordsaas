/**
 * Options Step Component
 * Created: 2025/3/15
 * 
 * このコンポーネントは、コマンドウィザードのオプション設定ステップを表示します。
 * コマンドのオプションを視覚的に設定できます。
 */

import { StepProps } from "../command-wizard-types"
import { VisualCommandBuilder } from "../visual-command-builder"
import { InteractiveCommandPreview } from "../interactive-command-preview"

export function OptionsStep({
  command,
  updateCommand
}: StepProps) {
  return (
    <div className="space-y-6">
      <VisualCommandBuilder
        commandName={command.name || "command"}
        options={command.options || []}
        onChange={(options) => updateCommand({ options })}
      />
      
      <div className="border-t pt-6">
        <h4 className="text-lg font-medium mb-4">インタラクティブプレビュー</h4>
        <InteractiveCommandPreview
          commandName={command.name || "command"}
          options={command.options || []}
        />
      </div>
    </div>
  );
}
