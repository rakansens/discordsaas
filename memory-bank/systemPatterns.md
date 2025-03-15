# System Patterns

## Architecture Overview

The Discord Bot Control Center follows a modern web application architecture with clear separation of concerns and a focus on security, scalability, and real-time capabilities.

```mermaid
flowchart TD
    Client[Client Browser] <--> NextJS[Next.js Application]
    NextJS <--> SupaDB[(Supabase Database)]
    NextJS <--> SupaStorage[Supabase Storage]
    NextJS <--> SupaRealtime[Supabase Realtime]
    NextJS <--> Auth[NextAuth.js]
    Auth <--> DiscordOAuth[Discord OAuth]
    Auth <--> GoogleOAuth[Google OAuth]
    NextJS <--> ThirdPartyAPIs[Third-Party APIs]
    NextJS <--> BotProcesses[Bot Processes]
```

## Core Design Patterns

### Authentication Flow

The system implements a secure authentication flow using NextAuth.js with Discord and Google OAuth providers:

```mermaid
sequenceDiagram
    User->>+Frontend: Click Login (Discord/Google)
    Frontend->>+NextAuth: Redirect to OAuth Provider
    NextAuth->>+OAuth Provider: Authentication Request
    OAuth Provider->>+User: Login Prompt
    User->>+OAuth Provider: Provide Credentials
    OAuth Provider->>+NextAuth: Auth Token
    NextAuth->>+Supabase: Create/Update User
    Supabase->>+NextAuth: User Data
    NextAuth->>+Frontend: JWT Session Token
    Frontend->>+User: Redirect to Dashboard
```

### Bot Management Pattern

The system uses a controller pattern for bot management, allowing users to create, configure, and control their bots:

```mermaid
flowchart TD
    BotForm[Bot Creation Form] --> BotController[Bot Controller]
    BotController --> BotValidator[Input Validator]
    BotValidator --> TokenEncryptor[AES-256-GCM Encryption]
    TokenEncryptor --> SupabaseStorage[Supabase Database]
    BotController --> ProcessManager[Bot Process Manager]
    ProcessManager --> DiscordBot[Discord.js Bot Instance]
    DiscordBot --> StatusMonitor[Status Monitor]
    StatusMonitor --> RealtimeUpdates[Supabase Realtime]
    RealtimeUpdates --> UserInterface[User Interface]
```

### Command Configuration Pattern

Commands follow a hierarchical structure with options and prompts:

```mermaid
flowchart TD
    Bot --> Command1[Command]
    Bot --> Command2[Command]
    Command1 --> Option1[Option]
    Command1 --> Option2[Option]
    Command1 --> Prompt1[Prompt]
    Option1 --> SubOption1[Sub-Option]
    Option1 --> SubOption2[Sub-Option]
```

### Real-time Updates Pattern

The system leverages Supabase Realtime for instant status updates:

```mermaid
sequenceDiagram
    BotProcess->>+Supabase: Status Change
    Supabase->>+RealtimeChannel: Broadcast Update
    Client->>+Supabase: Subscribe to Channel
    RealtimeChannel->>+Client: Status Update
    Client->>+UI: Update Display
```

## Data Models

### User Model

```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  provider: 'discord' | 'google' | 'email';
  role: 'user' | 'admin';
  settings: {
    theme: 'dark' | 'light';
    notifications: boolean;
    language: 'ja' | 'en';
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Bot Model

```typescript
interface Bot {
  id: string;
  userId: string;
  name: string;
  clientId: string;
  encryptedToken: string;
  avatarUrl?: string;
  status: 'online' | 'offline' | 'error';
  settings: {
    prefix?: string;
    autoRestart: boolean;
    logLevel: 'info' | 'warn' | 'error' | 'debug';
  };
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Command Model

```typescript
interface Command {
  id: string;
  botId: string;
  name: string;
  description: string;
  usage?: string;
  options: CommandOption[];
  promptId?: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CommandOption {
  id: string;
  commandId: string;
  name: string;
  description: string;
  type: 'string' | 'integer' | 'boolean' | 'user' | 'channel';
  required: boolean;
  choices?: { name: string; value: string }[];
}
```

### Prompt Model

```typescript
interface Prompt {
  id: string;
  commandId: string;
  content: string;
  variables: string[];
  apiIntegration?: 'openai' | 'perplexity' | 'anthropic' | 'stability';
  createdAt: Date;
  updatedAt: Date;
}
```

## Security Patterns

### Token Encryption

Bot tokens and API credentials are encrypted using AES-256-GCM before storage:

```typescript
// Encryption
const encrypt = (text: string, secretKey: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('hex');
};

// Decryption
const decrypt = (encryptedHex: string, secretKey: string): string => {
  const buffer = Buffer.from(encryptedHex, 'hex');
  const iv = buffer.subarray(0, 16);
  const authTag = buffer.subarray(16, 32);
  const encrypted = buffer.subarray(32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', secretKey, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final('utf8');
};
```

### Row Level Security

Supabase RLS policies ensure users can only access their own data:

```sql
-- Example RLS policy for bots table
CREATE POLICY "Users can only access their own bots"
ON bots
FOR ALL
USING (auth.uid() = user_id);
```

## Component Patterns

### Layout Structure

The application follows a consistent layout pattern:

```mermaid
flowchart TD
    RootLayout[Root Layout] --> Header[Header]
    RootLayout --> Sidebar[Sidebar Navigation]
    RootLayout --> MainContent[Main Content Area]
    RootLayout --> Footer[Footer]
    MainContent --> PageTitle[Page Title]
    MainContent --> ActionButtons[Action Buttons]
    MainContent --> ContentArea[Content Area]
```

### Form Patterns

Forms follow a consistent pattern with validation and error handling:

```mermaid
flowchart TD
    Form[Form Component] --> FormFields[Form Fields]
    Form --> ValidationLogic[Validation Logic]
    Form --> SubmitHandler[Submit Handler]
    Form --> ErrorDisplay[Error Display]
    FormFields --> InputField[Input Field]
    FormFields --> SelectField[Select Field]
    FormFields --> FileUpload[File Upload]
    ValidationLogic --> ClientValidation[Client-side Validation]
    ValidationLogic --> ServerValidation[Server-side Validation]
```

## State Management Patterns

The application uses a combination of React Context and local component state:

```mermaid
flowchart TD
    GlobalState[Global State] --> AuthContext[Auth Context]
    GlobalState --> ThemeContext[Theme Context]
    GlobalState --> NotificationContext[Notification Context]
    
    PageState[Page-level State] --> BotListState[Bot List State]
    PageState --> CommandState[Command State]
    
    ComponentState[Component-level State] --> FormState[Form State]
    ComponentState --> ModalState[Modal State]
    ComponentState --> DropdownState[Dropdown State]
```
