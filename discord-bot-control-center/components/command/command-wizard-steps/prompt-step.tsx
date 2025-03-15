/**
 * Prompt Step Component
 * Created: 2025/3/15
 * 
 * このコンポーネントは、コマンドウィザードのプロンプト設定ステップを表示します。
 * コマンドの応答プロンプトを設定できます。
 */

import { StepProps } from "../command-wizard-types"
import { PromptTemplateEditor } from "../prompt-template-editor"

export function PromptStep({
  command,
  promptContent,
  promptVariables,
  updatePrompt
}: StepProps) {
  return (
    <PromptTemplateEditor
      content={promptContent}
      variables={promptVariables}
      onChange={updatePrompt}
      commandOptions={command.options}
    />
  );
}
