# Supabase連携実装計画

## 概要

Discord Bot Control Centerのデータ永続化と実際のボット操作を実現するために、Supabaseとの連携を強化します。現在のモックデータを実際のデータに置き換え、管理画面からボットの操作を可能にします。

## 目標

1. **管理画面からボットの操作を可能にする**
   - ボットの起動/停止
   - ボットのステータス監視
   - コマンドの登録/更新/削除
   - リアルタイムログの表示

2. **モックデータを実際のデータに置き換える**
   - ボット情報の永続化
   - コマンド設定の永続化
   - API連携設定の永続化
   - テンプレートの永続化

3. **テンプレートを本番環境でも使えるようにする**
   - テンプレートからの実際のボット/コマンド作成
   - テンプレート設定の保存と共有
   - カスタムテンプレートの作成

## データベース設計

### テーブル構造

1. **bots**
   ```sql
   CREATE TABLE public.bots (
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
   ```

2. **commands**
   ```sql
   CREATE TABLE public.commands (
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
   ```

3. **prompts**
   ```sql
   CREATE TABLE public.prompts (
     id SERIAL PRIMARY KEY,
     command_id INTEGER REFERENCES public.commands(id) ON DELETE CASCADE,
     content TEXT NOT NULL,
     variables JSONB DEFAULT '[]',
     api_integration JSONB DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```

4. **api_integrations**
   ```sql
   CREATE TABLE public.api_integrations (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     service VARCHAR(255) NOT NULL,
     encrypted_key TEXT NOT NULL,
     settings JSONB DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```

5. **templates**
   ```sql
   CREATE TABLE public.templates (
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
   ```

6. **command_logs**
   ```sql
   CREATE TABLE public.command_logs (
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
   ```

### Row Level Security (RLS)

各テーブルにRLSポリシーを設定し、ユーザーが自分のデータのみにアクセスできるようにします。

```sql
-- ボットテーブルのRLSポリシー
CREATE POLICY "Users can only access their own bots"
ON public.bots
FOR ALL
USING (auth.uid() = user_id);

-- コマンドテーブルのRLSポリシー
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

-- 同様に他のテーブルにもRLSポリシーを設定
```

## 実装計画

### フェーズ1: データベース構築とバックエンド連携（3日間）

1. **Supabaseテーブル構造の作成**
   - 上記のテーブル定義に基づいてテーブルを作成
   - RLSポリシーの設定
   - インデックスの作成

2. **バックエンドAPI実装**
   - ボットCRUD操作のAPI実装
   - コマンドCRUD操作のAPI実装
   - API連携設定のAPI実装
   - テンプレート操作のAPI実装

3. **認証フローの完成**
   - NextAuth.jsとSupabaseの連携強化
   - ユーザー権限管理の実装

### フェーズ2: フロントエンド連携（4日間）

1. **ボット管理画面の実装**
   - モックデータからSupabaseデータへの切り替え
   - ボット作成/編集/削除機能の実装
   - ボットステータス表示の実装

2. **コマンド管理画面の実装**
   - モックデータからSupabaseデータへの切り替え
   - コマンド作成/編集/削除機能の実装
   - コマンドプレビューの実装

3. **テンプレート管理の実装**
   - テンプレートからの実際のボット/コマンド作成機能
   - テンプレート保存機能
   - テンプレート共有機能

4. **API連携設定の実装**
   - API連携設定の保存/読み込み機能
   - API連携テストの実装

### フェーズ3: Discord Bot実行エンジンの実装（5日間）

1. **Discord.jsボット実行エンジンの実装**
   - ボット起動/停止機能
   - コマンド登録機能
   - イベントハンドリング

2. **API連携実行ロジックの実装**
   - OpenAI API連携の実装
   - Perplexity API連携の実装
   - その他のAPI連携の実装

3. **ステータス監視とログ機能の実装**
   - リアルタイムステータス監視
   - コマンド実行ログの記録
   - エラーハンドリングとリトライロジック

### フェーズ4: テスト・最適化・デプロイ（3日間）

1. **テスト**
   - 単体テスト
   - 統合テスト
   - エンドツーエンドテスト

2. **パフォーマンス最適化**
   - クエリ最適化
   - キャッシュ戦略
   - バンドルサイズ最適化

3. **デプロイ準備**
   - 環境変数設定
   - CI/CD設定
   - 本番環境デプロイ

## 技術的アプローチ

### バックエンド

1. **Supabase SDK活用**
   ```typescript
   // ボット取得の例
   const fetchBots = async () => {
     const { data, error } = await supabase
       .from('bots')
       .select('*')
       .order('created_at', { ascending: false });
     
     if (error) throw error;
     return data;
   };
   ```

2. **トークン暗号化**
   ```typescript
   // トークン暗号化の例
   const encryptToken = (token: string) => {
     const iv = crypto.randomBytes(16);
     const cipher = crypto.createCipheriv('aes-256-gcm', process.env.ENCRYPTION_KEY!, iv);
     const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
     const authTag = cipher.getAuthTag();
     return Buffer.concat([iv, authTag, encrypted]).toString('hex');
   };
   ```

3. **リアルタイム更新**
   ```typescript
   // リアルタイム更新の例
   const subscribeToBotsStatus = () => {
     const subscription = supabase
       .from('bots')
       .on('UPDATE', (payload) => {
         // ステータス更新時の処理
         updateBotStatus(payload.new);
       })
       .subscribe();
     
     return () => supabase.removeSubscription(subscription);
   };
   ```

### フロントエンド

1. **React Query活用**
   ```typescript
   // React Queryを使用したデータフェッチの例
   const { data: bots, isLoading, error } = useQuery(
     ['bots'],
     fetchBots,
     {
       refetchInterval: 30000, // 30秒ごとに再取得
       staleTime: 10000, // 10秒間はキャッシュを新鮮と見なす
     }
   );
   ```

2. **フォーム状態管理**
   ```typescript
   // React Hook Formを使用したフォーム管理の例
   const { register, handleSubmit, formState: { errors } } = useForm<BotFormData>({
     defaultValues: {
       name: '',
       token: '',
       // その他のデフォルト値
     }
   });
   
   const onSubmit = async (data: BotFormData) => {
     // ボット作成/更新処理
   };
   ```

3. **モーダル・ダイアログ管理**
   ```typescript
   // ダイアログ状態管理の例
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
   const [botToDelete, setBotToDelete] = useState<Bot | null>(null);
   
   const handleDeleteClick = (bot: Bot) => {
     setBotToDelete(bot);
     setIsDeleteDialogOpen(true);
   };
   
   const confirmDelete = async () => {
     if (!botToDelete) return;
     await deleteBot(botToDelete.id);
     setIsDeleteDialogOpen(false);
     setBotToDelete(null);
   };
   ```

### Discord Bot実行エンジン

1. **Discord.js活用**
   ```typescript
   // Discord.jsボット初期化の例
   const initBot = async (botId: number, token: string) => {
     const client = new Client({
       intents: [
         GatewayIntentBits.Guilds,
         GatewayIntentBits.GuildMessages,
         // その他の必要なintents
       ]
     });
     
     // イベントハンドラ設定
     client.on('ready', () => {
       updateBotStatus(botId, 'online');
       console.log(`Bot ${client.user?.tag} is online!`);
     });
     
     // コマンド登録
     await registerCommands(client, botId);
     
     // ログイン
     await client.login(token);
     
     return client;
   };
   ```

2. **コマンド登録**
   ```typescript
   // コマンド登録の例
   const registerCommands = async (client: Client, botId: number) => {
     const { data: commands } = await supabase
       .from('commands')
       .select('*')
       .eq('bot_id', botId)
       .eq('enabled', true);
     
     if (!commands) return;
     
     const rest = new REST({ version: '10' }).setToken(client.token!);
     
     const commandData = commands.map(command => ({
       name: command.name,
       description: command.description,
       options: formatCommandOptions(command.options),
     }));
     
     try {
       await rest.put(
         Routes.applicationCommands(client.user!.id),
         { body: commandData }
       );
       console.log(`Registered ${commands.length} commands for bot ${botId}`);
     } catch (error) {
       console.error('Error registering commands:', error);
     }
   };
   ```

3. **コマンド実行とAPI連携**
   ```typescript
   // コマンド実行の例
   client.on('interactionCreate', async (interaction) => {
     if (!interaction.isCommand()) return;
     
     const { commandName, options } = interaction;
     
     try {
       // コマンド情報取得
       const { data: command } = await supabase
         .from('commands')
         .select('*, prompts(*)')
         .eq('name', commandName)
         .eq('bot_id', botId)
         .single();
       
       if (!command) return;
       
       // ログ記録開始
       const logEntry = await createCommandLog(command.id, botId, interaction);
       
       // 応答を遅延
       await interaction.deferReply();
       
       // 入力オプションの処理
       const inputValues = processCommandOptions(interaction.options, command.options);
       
       // プロンプト処理とAPI連携
       const result = await processPromptWithApiIntegration(
         command.prompts,
         inputValues,
         interaction
       );
       
       // 応答
       await interaction.editReply(result);
       
       // ログ更新
       await updateCommandLog(logEntry.id, result, 'success');
     } catch (error) {
       console.error(`Error executing command ${commandName}:`, error);
       
       // エラー応答
       const errorMessage = 'コマンドの実行中にエラーが発生しました。';
       if (interaction.deferred) {
         await interaction.editReply(errorMessage);
       } else {
         await interaction.reply({ content: errorMessage, ephemeral: true });
       }
       
       // ログ更新
       if (logEntry) {
         await updateCommandLog(logEntry.id, String(error), 'error');
       }
     }
   });
   ```

## リスク管理

1. **セキュリティリスク**
   - ボットトークンの安全な保管と暗号化
   - API連携キーの安全な保管と暗号化
   - RLSポリシーの適切な設定

2. **パフォーマンスリスク**
   - 大量のボット/コマンドがある場合のパフォーマンス
   - リアルタイム更新の負荷
   - API連携の応答時間

3. **Discord API制限**
   - レート制限への対応
   - コマンド登録制限への対応

## スケジュール

| フェーズ | タスク | 期間 | 担当 |
|---------|-------|------|------|
| 1 | データベース構築 | 1日目 | 開発者 |
| 1 | バックエンドAPI実装 | 2-3日目 | 開発者 |
| 2 | ボット管理画面実装 | 4-5日目 | 開発者 |
| 2 | コマンド管理画面実装 | 6-7日目 | 開発者 |
| 3 | Discord Bot実行エンジン | 8-10日目 | 開発者 |
| 3 | API連携実行ロジック | 11-12日目 | 開発者 |
| 4 | テスト・最適化 | 13-14日目 | 開発者 |
| 4 | デプロイ準備 | 15日目 | 開発者 |

## 次のステップ

1. **データベース構築の開始**
   - Supabaseプロジェクトの設定確認
   - テーブル作成SQLの実行
   - RLSポリシーの設定

2. **バックエンドAPI実装の準備**
   - API設計の詳細化
   - 必要なライブラリのインストール
   - テスト環境の準備
