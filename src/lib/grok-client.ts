interface GrokConfig {
  apiKey: string;
  baseURL: string;
  timeout: number;
  maxRetries: number;
}

interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GrokChatRequest {
  model: string;
  messages: GrokMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface GrokChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class GrokClient {
  private config: GrokConfig;

  constructor(config: Partial<GrokConfig> = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.GROK_AI_API_KEY || '',
      baseURL: config.baseURL || process.env.GROK_AI_BASE_URL || 'https://api.x.ai/v1',
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3
    };

    if (!this.config.apiKey) {
      throw new Error('Grok AI API key is required');
    }
  }

  async chatCompletion(request: GrokChatRequest): Promise<GrokChatResponse> {
    const url = `${this.config.baseURL}/chat/completions`;
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data: GrokChatResponse = await response.json();
        return data;

      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.config.maxRetries) {
          break;
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Failed to complete request after retries');
  }

  async generateResponse(
    message: string, 
    conversation: GrokMessage[] = [],
    options: Partial<GrokChatRequest> = {}
  ): Promise<string> {
    const systemPrompt = `You are a helpful AI assistant specializing in career guidance, job search assistance, and general support. You provide:

1. **Job Search Help**: Resume advice, interview preparation, job market insights
2. **Career Guidance**: Career path recommendations, skill development, professional growth  
3. **General Support**: Answer questions, provide information, and assist with various topics

Guidelines:
- Be professional, helpful, and encouraging
- Provide actionable advice and specific recommendations
- Ask clarifying questions when needed
- Keep responses concise but comprehensive
- Focus on practical solutions and real-world applications`;

    const messages: GrokMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversation.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    const request: GrokChatRequest = {
      model: 'grok-beta',
      messages,
      temperature: 0.7,
      max_tokens: 1500,
      stream: false,
      ...options
    };

    const response = await this.chatCompletion(request);
    
    if (!response.choices || response.choices.length === 0) {
      throw new Error('No response generated');
    }

    return response.choices[0].message.content;
  }
}

export const grokClient = new GrokClient();