-- Discord Bot Control Center データベース設定スクリプト

-- ボットテーブル
CREATE TABLE IF NOT EXISTS public.bots (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  client_id VARCHAR(255) NOT NULL,
  encrypted_token TEXT NOT NULL,
  avatar_url TEXT,
  status VARCHAR(50) DEFAULT 'offline',
  settings JSONB DEFAULT '{}',
  last_active TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- コマンドテーブル
CREATE TABLE IF NOT EXISTS public.commands (
  id SERIAL PRIMARY KEY,
  bot_id INTEGER REFERENCES public.bots(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  options JSONB DEFAULT '[]',
  prompt_id INTEGER,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- プロンプトテーブル
CREATE TABLE IF NOT EXISTS public.prompts (
  id SERIAL PRIMARY KEY,
  command_id INTEGER REFERENCES public.commands(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  api_integration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- API連携テーブル
CREATE TABLE IF NOT EXISTS public.api_integrations (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  service VARCHAR(255) NOT NULL,
  encrypted_key TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- テンプレートテーブル
CREATE TABLE IF NOT EXISTS public.templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(255) NOT NULL,
  command_structure JSONB NOT NULL,
  prompt_structure JSONB,
  api_integration_structure JSONB,
  is_public BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- コマンドログテーブル
CREATE TABLE IF NOT EXISTS public.command_logs (
  id SERIAL PRIMARY KEY,
  command_id INTEGER REFERENCES public.commands(id) ON DELETE SET NULL,
  bot_id INTEGER REFERENCES public.bots(id) ON DELETE SET NULL,
  user_id VARCHAR(255) NOT NULL,
  guild_id VARCHAR(255) NOT NULL,
  channel_id VARCHAR(255) NOT NULL,
  input JSONB NOT NULL,
  output TEXT,
  status VARCHAR(50) NOT NULL,
  execution_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_bots_user_id ON public.bots(user_id);
CREATE INDEX IF NOT EXISTS idx_commands_bot_id ON public.commands(bot_id);
CREATE INDEX IF NOT EXISTS idx_prompts_command_id ON public.prompts(command_id);
CREATE INDEX IF NOT EXISTS idx_api_integrations_user_id ON public.api_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON public.templates(user_id);
CREATE INDEX IF NOT EXISTS idx_command_logs_command_id ON public.command_logs(command_id);
CREATE INDEX IF NOT EXISTS idx_command_logs_bot_id ON public.command_logs(bot_id);

-- RLSポリシー設定

-- ボットテーブルのRLSポリシー
ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own bots"
ON public.bots
FOR ALL
USING (auth.uid() = user_id);

-- コマンドテーブルのRLSポリシー
ALTER TABLE public.commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access commands for their bots"
ON public.commands
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.bots
    WHERE bots.id = commands.bot_id
    AND bots.user_id = auth.uid()
  )
);

-- プロンプトテーブルのRLSポリシー
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access prompts for their commands"
ON public.prompts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.commands
    JOIN public.bots ON bots.id = commands.bot_id
    WHERE prompts.command_id = commands.id
    AND bots.user_id = auth.uid()
  )
);

-- API連携テーブルのRLSポリシー
ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own API integrations"
ON public.api_integrations
FOR ALL
USING (auth.uid() = user_id);

-- テンプレートテーブルのRLSポリシー
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access public templates or their own templates"
ON public.templates
FOR SELECT
USING (is_public OR auth.uid() = user_id);

CREATE POLICY "Users can only modify their own templates"
ON public.templates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own templates"
ON public.templates
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own templates"
ON public.templates
FOR DELETE
USING (auth.uid() = user_id);

-- コマンドログテーブルのRLSポリシー
ALTER TABLE public.command_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access logs for their bots"
ON public.command_logs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.bots
    WHERE bots.id = command_logs.bot_id
    AND bots.user_id = auth.uid()
  )
);

-- トリガー関数: 更新時にupdated_atを更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルに更新トリガーを設定
CREATE TRIGGER update_bots_updated_at
BEFORE UPDATE ON public.bots
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commands_updated_at
BEFORE UPDATE ON public.commands
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at
BEFORE UPDATE ON public.prompts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_integrations_updated_at
BEFORE UPDATE ON public.api_integrations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
BEFORE UPDATE ON public.templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
