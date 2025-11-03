import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface GuardrailsConfig {
  tone: string;
  length: string;
  includeCallToAction: boolean;
  formalityLevel: string;
  brandVoice?: string;
}

interface GenerateRequest {
  userInput: string;
  guardrails: GuardrailsConfig;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { userInput, guardrails } = body;

    if (!userInput || userInput.trim().length === 0) {
      return NextResponse.json(
        { error: 'Email description is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const lengthGuidelines: Record<string, string> = {
      short: 'approximately 100 words',
      medium: 'approximately 200 words',
      long: 'approximately 300 words',
    };

    const systemPrompt = `You are a professional email writer. Generate an email based on the user's description with these specifications:
- Tone: ${guardrails.tone}
- Length: ${lengthGuidelines[guardrails.length] || 'medium length'}
- Formality: ${guardrails.formalityLevel}
${guardrails.includeCallToAction ? '- Include a clear call-to-action at the end' : ''}
${guardrails.brandVoice ? `- Brand voice: ${guardrails.brandVoice}` : ''}

Create a complete, ready-to-send email with proper greeting, body, and signature. Do not include a subject line. Format the email professionally.`;

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: userInput,
      temperature: 0.7,
    });

    return NextResponse.json({ generatedEmail: text });
  } catch (error: any) {
    console.error('Error generating email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate email' },
      { status: 500 }
    );
  }
}
