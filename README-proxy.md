# ShadowGuard Chat Proxy

This is a minimal server proxy to safely forward chat requests to OpenRouter or Hugging Face. It keeps API keys on the server and avoids storing them in client browsers.

## Setup

1. Install dependencies:

```powershell
cd D:\Hackthon\Shadowguard\server
npm install
```

2. Set environment variables (PowerShell example):

```powershell
$env:HF_API_KEY = "your_huggingface_token_here"
$env:OPENROUTER_KEY = "your_openrouter_key_here"
#$env:OPENROUTER_MODEL = "openai/gpt-4o" # optional
#$env:HF_MODEL = "facebook/blenderbot-400M-distill" # optional
```

3. Start the proxy:

```powershell
npm start
```

The proxy listens on `http://localhost:3000` by default.

## API

POST `/api/chat` with JSON body:

- `provider`: `openrouter` or `huggingface` (defaults to `huggingface`)
- `model`: optional model id
- `messages`: optional array of `{ role: 'user'|'assistant', content: '...' }`
- `input`: optional plain text input

Example body:

```json
{
  "provider": "openrouter",
  "model": "openai/gpt-4o",
  "messages": [{ "role": "user", "content": "Hello" }]
}
```

The response: `{ text: string, raw: object }`.
