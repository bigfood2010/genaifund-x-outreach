function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required env var ${name}. See .env.example.`);
  return value;
}

function list(name: string): string[] {
  return (process.env[name] ?? '').split(',').map((s) => s.trim().replace(/^@/, '').toLowerCase()).filter(Boolean);
}

export type Config = ReturnType<typeof loadConfig>;

export function loadConfig() {
  const port = Number(process.env.PORT ?? 3000);
  const tokenKey = Buffer.from(required('TOKEN_ENCRYPTION_KEY'), 'base64');
  if (tokenKey.length !== 32) throw new Error('TOKEN_ENCRYPTION_KEY must be 32 bytes, base64. Generate: openssl rand -base64 32');
  return {
    port,
    baseUrl: process.env.BASE_URL ?? `http://127.0.0.1:${port}`,
    dbPath: process.env.DB_PATH ?? 'data/outreach.db',
    x: { clientId: required('X_CLIENT_ID'), clientSecret: required('X_CLIENT_SECRET') },
    llm: {
      baseUrl: process.env.LLM_BASE_URL ?? 'https://generativelanguage.googleapis.com/v1beta/openai',
      apiKey: required('LLM_API_KEY'),
      model: process.env.LLM_MODEL ?? 'gemini-3.5-flash-lite',
    },
    tokenKey,
    sessionSecret: required('SESSION_SECRET'),
    allowedOperators: list('ALLOWED_OPERATORS'),
    liveSending: process.env.LIVE_SENDING === 'true',
    testRecipients: list('TEST_RECIPIENTS'),
    senderDescription: process.env.SENDER_DESCRIPTION
      ?? 'GenAI Fund builds AI ecosystems in Southeast Asia and wants meaningful conversations with relevant builders.',
    noReplyHours: Number(process.env.NO_REPLY_HOURS ?? 72),
    maxProspectsPerRun: Math.min(Number(process.env.MAX_PROSPECTS_PER_RUN ?? 10), 50),
  };
}
