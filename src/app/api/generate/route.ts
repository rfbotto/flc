import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextRequest, NextResponse } from 'next/server';
import { moderateContent } from '@/lib/moderation';
import { validateContent } from '@/lib/validators';
import type { GuardrailsConfig } from '@/types/guardrails';

interface EmailGenerationConfig {
  tone: string;
  length: string;
  includeCallToAction: boolean;
  formalityLevel: string;
  brandVoice?: string;
}

interface GenerateRequest {
  userInput: string;
  emailConfig: EmailGenerationConfig;
  guardrailsConfig?: GuardrailsConfig;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { userInput, emailConfig, guardrailsConfig } = body;

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

    if (guardrailsConfig) {
      try {
        const inputModeration = await moderateContent(userInput, guardrailsConfig);
        if (inputModeration.flagged) {
          return NextResponse.json(
            {
              error: 'Content Moderation Failed',
              message: `Your input was flagged for: ${inputModeration.violation_type}. Please revise your request.`,
              moderationResult: inputModeration,
              stage: 'input',
            },
            { status: 400 }
          );
        }

        const inputValidation = validateContent(
          userInput,
          guardrailsConfig.validators,
          'input'
        );
        if (!inputValidation.valid) {
          return NextResponse.json(
            {
              error: 'Validation Failed',
              message: 'Your input violates content policies.',
              violations: inputValidation.violations,
              stage: 'input',
            },
            { status: 400 }
          );
        }
      } catch (moderationError) {
        console.error('Moderation error:', moderationError);
      }
    }

    const lengthGuidelines: Record<string, string> = {
      short: 'approximately 100 words',
      medium: 'approximately 200 words',
      long: 'approximately 300 words',
    };

    const systemPrompt = `You are a professional email writer. Generate an email based on the user's description with these specifications:
- Tone: ${emailConfig.tone}
- Length: ${lengthGuidelines[emailConfig.length] || 'medium length'}
- Formality: ${emailConfig.formalityLevel}
${emailConfig.includeCallToAction ? '- Include a clear call-to-action at the end' : ''}
${emailConfig.brandVoice ? `- Brand voice: ${emailConfig.brandVoice}` : ''}

Create a complete, ready-to-send email with proper greeting, body, and signature. Do not include a subject line. Format the email professionally.`;

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: userInput,
      temperature: 0.7,
    });

    if (guardrailsConfig) {
      try {
        const outputModeration = await moderateContent(text, guardrailsConfig);
        if (outputModeration.flagged) {
          return NextResponse.json(
            {
              error: 'Generated Content Flagged',
              message: `The generated email was flagged for: ${outputModeration.violation_type}. Please try a different request.`,
              moderationResult: outputModeration,
              stage: 'output',
            },
            { status: 400 }
          );
        }

        const outputValidation = validateContent(
          text,
          guardrailsConfig.validators,
          'output'
        );
        if (!outputValidation.valid) {
          return NextResponse.json(
            {
              error: 'Generated Content Validation Failed',
              message: 'The generated email does not meet quality standards.',
              violations: outputValidation.violations,
              stage: 'output',
            },
            { status: 400 }
          );
        }
      } catch (moderationError) {
        console.error('Output moderation error:', moderationError);
      }
    }

    return NextResponse.json({
      generatedEmail: text,
      guardrailsPassed: true,
    });
  } catch (error: any) {
    console.error('Error generating email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate email' },
      { status: 500 }
    );
  }
}
