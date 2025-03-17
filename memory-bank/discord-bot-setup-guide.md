# Discord Bot 開発ガイド

## Discord Developer Portal でのボット作成手順

### 1. Discord Developer Portal にアクセス

1. [Discord Developer Portal](https://discord.com/developers/applications) にアクセスします
2. Discord アカウントでログインします

### 2. 新しいアプリケーションを作成

1. 右上の「New Application」ボタンをクリックします
2. アプリケーション名を入力します（これがボットの名前になります）
3. 利用規約に同意し、「Create」ボタンをクリックします

### 3. ボットの設定

1. 左側のメニューから「Bot」を選択します
2. 「Add Bot」ボタンをクリックし、確認ダイアログで「Yes, do it!」をクリックします
3. ボットのアイコンをカスタマイズできます（オプション）
4. ボットの設定を行います：
   - **Public Bot**: オンにすると誰でもボットを追加できます。オフにすると、あなただけがボットを追加できます
   - **Requires OAuth2 Code Grant**: 通常はオフのままにします
   - **Presence Intent**: ボットがユーザーのステータス（オンライン、オフラインなど）を取得するために必要です
   - **Server Members Intent**: ボットがサーバーメンバーのリストを取得するために必要です
   - **Message Content Intent**: ボットがメッセージの内容を読み取るために必要です（スラッシュコマンドのみを使用する場合は不要）

5. 「Save Changes」ボタンをクリックします

### 4. ボットトークンの取得

1. 「Bot」セクションの「Token」の下にある「Reset Token」または「Copy」ボタンをクリックします
2. トークンをコピーして安全な場所に保存します（このトークンは二度と表示されないので注意してください）
3. このトークンを環境変数（`.env.local`ファイル）に追加します：
   ```
   DISCORD_BOT_TOKEN=your-bot-token-here
   ```

### 5. OAuth2 設定

1. 左側のメニューから「OAuth2」→「URL Generator」を選択します
2. 「SCOPES」セクションで以下を選択します：
   - `bot`: ボットとしての機能を有効にします
   - `applications.commands`: スラッシュコマンドを使用するために必要です

3. 「BOT PERMISSIONS」セクションで必要な権限を選択します：
   - **基本的な権限**:
     - `Send Messages`: メッセージを送信する権限
     - `Read Messages/View Channels`: チャンネルとメッセージを読む権限
     - `Embed Links`: 埋め込みリンクを送信する権限
     - `Attach Files`: ファイルを添付する権限
     - `Use Slash Commands`: スラッシュコマンドを使用する権限

   - **追加の権限** (機能に応じて):
     - `Manage Messages`: メッセージを管理（削除など）する権限
     - `Add Reactions`: リアクションを追加する権限
     - `Read Message History`: メッセージ履歴を読む権限
     - `Mention Everyone`: @everyone や @here を使用する権限
     - `Manage Channels`: チャンネルを管理する権限
     - `Manage Roles`: ロールを管理する権限

4. 生成されたURLをコピーします

### 6. ボットをサーバーに追加

1. コピーしたURLをブラウザで開きます
2. ボットを追加するサーバーを選択します
3. 「Authorize」ボタンをクリックします
4. キャプチャを完了します
5. ボットがサーバーに追加されたことを確認します

## Discord Bot 実装フロー

### 1. プロジェクトのセットアップ

1. **必要なパッケージのインストール**:
   ```bash
   npm install discord.js @discordjs/rest discord-api-types
   ```

2. **ボットの基本構造**:
   ```javascript
   // bot.js
   const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
   const { token, clientId, guildId } = require('./config.json');

   // クライアントの作成
   const client = new Client({
     intents: [
       GatewayIntentBits.Guilds,
       GatewayIntentBits.GuildMessages,
       // 必要に応じて追加
     ]
   });

   // ボットが準備完了したときのイベント
   client.once('ready', () => {
     console.log(`Logged in as ${client.user.tag}!`);
   });

   // ボットにログイン
   client.login(token);
   ```

### 2. スラッシュコマンドの登録

1. **コマンド定義**:
   ```javascript
   // commands.js
   const commands = [
     {
       name: 'ping',
       description: 'Replies with Pong!',
     },
     {
       name: 'echo',
       description: 'Echoes your input',
       options: [
         {
           name: 'input',
           type: 3, // STRING
           description: 'The input to echo back',
           required: true,
         },
       ],
     },
     // 他のコマンドを追加
   ];

   module.exports = commands;
   ```

2. **コマンドの登録**:
   ```javascript
   // deploy-commands.js
   const { REST } = require('@discordjs/rest');
   const { Routes } = require('discord-api-types/v9');
   const { token, clientId, guildId } = require('./config.json');
   const commands = require('./commands');

   const rest = new REST({ version: '9' }).setToken(token);

   (async () => {
     try {
       console.log('Started refreshing application (/) commands.');

       await rest.put(
         Routes.applicationGuildCommands(clientId, guildId),
         { body: commands },
       );

       console.log('Successfully reloaded application (/) commands.');
     } catch (error) {
       console.error(error);
     }
   })();
   ```

### 3. コマンドの処理

```javascript
// bot.js
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'ping') {
    await interaction.reply('Pong!');
  } else if (commandName === 'echo') {
    const input = interaction.options.getString('input');
    await interaction.reply(input);
  }
  // 他のコマンドを処理
});
```

### 4. API連携の実装

```javascript
// api-integration.js
const axios = require('axios');

// OpenAI APIとの連携例
async function callOpenAI(prompt) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return 'Sorry, I encountered an error processing your request.';
  }
}

module.exports = { callOpenAI };
```

### 5. 複数API連携フローの実装

```javascript
// api-flow.js
const { callOpenAI } = require('./api-integration');
const axios = require('axios');

// Perplexity APIとの連携例
async function callPerplexity(query) {
  try {
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'pplx-7b-online',
        messages: [{ role: 'user', content: query }],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Perplexity API:', error);
    return 'Sorry, I encountered an error processing your request.';
  }
}

// 複数API連携フローの例
async function multiApiFlow(input, flow) {
  let result = input;
  
  for (const step of flow) {
    switch (step.service) {
      case 'openai':
        result = await callOpenAI(step.prompt.replace('{input}', result));
        break;
      case 'perplexity':
        result = await callPerplexity(step.prompt.replace('{input}', result));
        break;
      // 他のAPIサービスを追加
    }
  }
  
  return result;
}

module.exports = { multiApiFlow };
```

### 6. コマンドとAPI連携フローの統合

```javascript
// bot.js
const { multiApiFlow } = require('./api-flow');

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'analyze') {
    await interaction.deferReply(); // 処理に時間がかかる場合
    
    const input = interaction.options.getString('text');
    const flow = [
      {
        service: 'openai',
        prompt: 'Analyze the following text and extract key points: {input}'
      },
      {
        service: 'perplexity',
        prompt: 'Provide additional context and information about these key points: {input}'
      }
    ];
    
    const result = await multiApiFlow(input, flow);
    await interaction.editReply(result);
  }
});
```

## Discord Bot Control Center との連携

Discord Bot Control Centerを使用すると、上記の手順を大幅に簡略化できます。以下は連携の流れです：

1. Discord Developer Portalでボットを作成し、トークンを取得します
2. Discord Bot Control Centerの環境変数にトークンを設定します：
   ```
   DISCORD_BOT_TOKEN=your-bot-token-here
   ```
3. Discord Bot Control Centerでボットを登録します
4. コマンドウィザードを使用して、コマンドを作成します
5. API連携フローを設定します
6. コマンドを保存して、ボットに反映します

これにより、コードを書かずにDiscord Botを作成・管理できます。

## 主要な設定項目

### ボットの基本設定

- **名前**: ボットの表示名
- **アバター**: ボットのプロフィール画像
- **説明**: ボットの説明（Developer Portalでのみ表示）
- **Public Bot**: 他のユーザーがボットを追加できるかどうか
- **Intents**: ボットが必要とするアクセス権限

### コマンド設定

- **名前**: コマンド名（小文字、英数字、ハイフン、アンダースコアのみ）
- **説明**: コマンドの説明（Discord上で表示される）
- **オプション**: コマンドのパラメータ
  - **名前**: オプション名
  - **説明**: オプションの説明
  - **タイプ**: 文字列、整数、ユーザー、チャンネルなど
  - **必須**: オプションが必須かどうか

### API連携設定

- **APIサービス**: 使用するAPIサービス（OpenAI、Perplexity、Anthropicなど）
- **APIキー**: 各サービスのAPIキー（環境変数で管理）
- **モデル**: 使用するAIモデル（GPT-4、Claude 3など）
- **パラメータ**: 各APIサービスの固有パラメータ
  - **最大トークン数**: 生成するテキストの最大長
  - **温度**: 生成テキストのランダム性（0.0〜1.0）
  - **トップP**: 生成テキストの多様性

### 複数API連携フロー設定

- **フローステップ**: 複数のAPIサービスを連携させるステップ
  - **サービス**: 使用するAPIサービス
  - **プロンプト**: APIに送信するプロンプト
  - **入力変数**: 前のステップの出力を参照する変数
  - **出力形式**: 次のステップに渡す出力の形式

### 出力先設定

- **グローバル**: すべてのチャンネルで使用可能
- **特定のサーバー**: 指定したサーバーでのみ使用可能
- **特定のチャンネル**: 指定したチャンネルでのみ使用可能
- **DMのみ**: ダイレクトメッセージでのみ使用可能
- **一時メッセージ**: 本人のみ表示される一時メッセージとして送信
