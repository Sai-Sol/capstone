import { NextRequest, NextResponse } from 'next/server';

interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GrokRequest {
  model: string;
  messages: GrokMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface GrokResponse {
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

// Rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 20; // 20 requests per minute

  const current = rateLimitMap.get(ip);
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please wait before sending another message.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      );
    }

    const { message, conversation = [] } = await request.json();

    // Input validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    if (message.length > 4000) {
      return NextResponse.json(
        { error: 'Message too long. Please keep it under 4000 characters.' },
        { status: 400 }
      );
    }

    // Validate conversation history
    if (!Array.isArray(conversation)) {
      return NextResponse.json(
        { error: 'Conversation must be an array' },
        { status: 400 }
      );
    }

    // Check API key
    const apiKey = process.env.GROK_AI_API_KEY;
    if (!apiKey) {
      console.error('Grok AI API key not configured');
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Prepare messages for Grok AI
    const systemPrompt = `You are a helpful AI assistant specializing in career guidance, job search assistance, and general support. You provide:

1. **Job Search Help**: Resume advice, interview preparation, job market insights
2. **Career Guidance**: Career path recommendations, skill development, professional growth
3. **General Support**: Answer questions, provide information, and assist with various topics

Guidelines:
- Be professional, helpful, and encouraging
- Provide actionable advice and specific recommendations
- Ask clarifying questions when needed
- Keep responses concise but comprehensive
- Focus on practical solutions and real-world applications

You are part of QuantumChain, a blockchain-based quantum computing platform, but you can help with any topic the user needs assistance with.`;

    const messages: GrokMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversation.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    const grokRequest: GrokRequest = {
      model: 'grok-beta',
      messages,
      temperature: 0.7,
      max_tokens: 1500,
      stream: false
    };

    // Call Grok AI API
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(grokRequest),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Grok AI API error:', response.status, errorData);
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'AI service authentication failed' },
          { status: 503 }
        );
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'AI service is busy. Please try again in a moment.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 503 }
      );
    }

    const grokResponse: GrokResponse = await response.json();
    
    if (!grokResponse.choices || grokResponse.choices.length === 0) {
      throw new Error('No response from Grok AI');
    }

    const aiMessage = grokResponse.choices[0].message.content;

    return NextResponse.json({
      response: aiMessage,
      usage: grokResponse.usage,
      model: grokResponse.model,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Grok AI API error:', error);
    
    return NextResponse.json(
      { 
        error: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}