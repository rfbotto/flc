import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextRequest, NextResponse } from 'next/server';
import { moderateContent } from '@/lib/moderation';
import { validateContent } from '@/lib/validators';
import { validateCustomGuardrails } from '@/lib/custom-guardrails';
import { detectUrls, fetchMultipleUrls, enrichContextWithUrls, type UrlFetchResult } from '@/lib/url-fetcher';
import type { GuardrailsConfig, OpenAIGuardrailsFormat } from '@/types/guardrails';

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
  context?: string;
  customSystemPrompt?: string;
  customGuardrails?: OpenAIGuardrailsFormat;
  contextSources?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { userInput, emailConfig, guardrailsConfig, context, customSystemPrompt, customGuardrails, contextSources } = body;

    const debugInfo: any = {
      inputModeration: null,
      outputModeration: null,
      inputValidation: null,
      outputValidation: null,
      customGuardrailsInput: null,
      customGuardrailsOutput: null,
      urlFetchResults: null,
    };

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

    let enrichedContext = context;
    if (context) {
      const detectedUrls = detectUrls(context);
      if (detectedUrls.length > 0) {
        console.log(`Detected ${detectedUrls.length} URLs in context, fetching content...`);
        const urlFetchResults = await fetchMultipleUrls(detectedUrls);
        debugInfo.urlFetchResults = urlFetchResults;

        const successfulFetches = urlFetchResults.filter(r => r.success);
        console.log(`Successfully fetched ${successfulFetches.length}/${detectedUrls.length} URLs`);

        enrichedContext = enrichContextWithUrls(context, urlFetchResults);
      }
    }

    if (guardrailsConfig) {
      try {
        const inputModeration = await moderateContent(userInput, guardrailsConfig);
        debugInfo.inputModeration = inputModeration;

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
        debugInfo.inputValidation = inputValidation;

        if (!inputValidation.valid) {
          return NextResponse.json(
            {
              error: 'Validation Failed',
              message: 'Your input violates content policies.',
              violations: inputValidation.violations,
              details: inputValidation.details,
              stage: 'input',
            },
            { status: 400 }
          );
        }

        if (customGuardrails) {
          const customGuardrailsValidation = await validateCustomGuardrails(
            userInput,
            customGuardrails,
            'input',
            contextSources
          );
          debugInfo.customGuardrailsInput = customGuardrailsValidation;

          if (!customGuardrailsValidation.valid) {
            return NextResponse.json(
              {
                error: 'Custom Guardrails Failed',
                message: 'Your input violates custom guardrail policies.',
                violations: customGuardrailsValidation.violations,
                details: customGuardrailsValidation.details,
                stage: 'input',
              },
              { status: 400 }
            );
          }
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

    let defaultSystemPrompt = 'You are a helpful AI assistant that generates professional email content based on user descriptions.';

    if (emailConfig) {
      defaultSystemPrompt = `You are a professional email writer. Generate an email based on the user's description with these specifications:
- Tone: ${emailConfig.tone}
- Length: ${lengthGuidelines[emailConfig.length] || 'medium length'}
- Formality: ${emailConfig.formalityLevel}
${emailConfig.includeCallToAction ? '- Include a clear call-to-action at the end' : ''}
${emailConfig.brandVoice ? `- Brand voice: ${emailConfig.brandVoice}` : ''}

Create a complete, ready-to-send email with proper greeting, body, and signature. Do not include a subject line. Format the email professionally.`;
    }

    const systemPrompt = customSystemPrompt || defaultSystemPrompt;

    const defaultContext = 'You are generating content for a professional business environment.';
    const contextPrefix = enrichedContext || defaultContext;

    const finalPrompt = `${contextPrefix}\n\n${userInput}`;

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: finalPrompt,
      temperature: 0.7,
    });

    if (guardrailsConfig) {
      try {
        const outputModeration = await moderateContent(text, guardrailsConfig);
        debugInfo.outputModeration = outputModeration;

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
        debugInfo.outputValidation = outputValidation;

        if (!outputValidation.valid) {
          return NextResponse.json(
            {
              error: 'Generated Content Validation Failed',
              message: 'The generated email does not meet quality standards.',
              violations: outputValidation.violations,
              details: outputValidation.details,
              stage: 'output',
            },
            { status: 400 }
          );
        }

        if (customGuardrails) {
          const customGuardrailsValidation = await validateCustomGuardrails(
            text,
            customGuardrails,
            'output',
            contextSources
          );
          debugInfo.customGuardrailsOutput = customGuardrailsValidation;

          if (!customGuardrailsValidation.valid) {
            return NextResponse.json(
              {
                error: 'Custom Guardrails Failed',
                message: 'The generated content violates custom guardrail policies.',
                violations: customGuardrailsValidation.violations,
                details: customGuardrailsValidation.details,
                stage: 'output',
              },
              { status: 400 }
            );
          }
        }
      } catch (moderationError) {
        console.error('Output moderation error:', moderationError);
      }
    }

    return NextResponse.json({
      generatedEmail: text,
      guardrailsPassed: true,
      debugInfo: guardrailsConfig ? {
        inputScores: debugInfo.inputModeration?.category_scores,
        outputScores: debugInfo.outputModeration?.category_scores,
        inputFlagged: debugInfo.inputModeration?.flagged,
        outputFlagged: debugInfo.outputModeration?.flagged,
        allChecksPassed: true,
        urlFetchResults: debugInfo.urlFetchResults,
      } : { urlFetchResults: debugInfo.urlFetchResults },
    });
  } catch (error: any) {
    console.error('Error generating email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate email' },
      { status: 500 }
    );
  }
}
