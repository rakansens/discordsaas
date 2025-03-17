/**
 * API Step Component
 * Created: 2025/3/15
 * 
 * このコンポーネントは、コマンドウィザードのAPI設定ステップを表示します。
 * 選択したAPIの詳細設定を行うことができます。
 */

import { StepProps } from "../command-wizard-types"
import { ApiIntegrationPanel } from "../api-integration-panel"

export function ApiStep({
  command,
  apiConfig,
  updateApiConfig
}: StepProps) {
  return (
    <ApiIntegrationPanel
      apiConfig={apiConfig || { service: "none", settings: {} }}
      command={command}
      onChange={updateApiConfig}
    />
  );
}
