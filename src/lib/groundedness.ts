import OpenAI from 'openai';
import { GroundednessResult } from '@/types/guardrails';

export interface GroundednessCheckOptions {
  text: string;
  context: string | string[];
  confidenceThreshold?: number;
  requireCitations?: boolean;
  model?: string;
}

export async function checkGroundedness(
  options: GroundednessCheckOptions
): Promise<GroundednessResult> {
  const {
    text,
    context,
    confidenceThreshold = 0.7,
    requireCitations = false,
    model = 'gpt-4o-mini',
  } = options;

  if (!process.env.OPENAI_API_KEY) {
    console.error('Groundedness check error: OPENAI_API_KEY not configured');
    return {
      grounded: false,
      confidence_score: 0,
      unsupported_claims: ['OpenAI API key not configured for groundedness check'],
      context_used: [],
    };
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const contextString = Array.isArray(context) ? context.join('\n\n') : context;

  const systemPrompt = `You are a fact-checking assistant that verifies if claims in text are supported by provided context.

Your task:
1. Analyze the text and identify all factual claims
2. Check if each claim is supported by the provided context
3. Return a JSON object with your analysis

Return format:
{
  "grounded": boolean (true if all claims are supported),
  "confidence_score": number (0-1, overall confidence),
  "unsupported_claims": string[] (list of claims not supported by context),
  "analysis": string (brief explanation)
}

Rules:
- A claim is "grounded" if it's directly stated or clearly implied by the context
- Do not accept vague connections or weak inferences
- Be strict about factual accuracy (numbers, dates, names must match exactly)
${requireCitations ? '- Require explicit evidence for each claim' : '- Allow reasonable inferences from context'}`;

  const userPrompt = `Context:
${contextString}

Text to verify:
${text}

Verify if the text is grounded in the context.`;

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(content);

    const isGrounded = result.grounded && result.confidence_score >= confidenceThreshold;

    return {
      grounded: isGrounded,
      confidence_score: result.confidence_score || 0,
      unsupported_claims: result.unsupported_claims || [],
      context_used: Array.isArray(context) ? context : [context],
    };
  } catch (error) {
    console.error('Groundedness check error:', error);
    return {
      grounded: false,
      confidence_score: 0,
      unsupported_claims: ['Error performing groundedness check'],
      context_used: [],
    };
  }
}

export async function checkGroundednessWithDetails(
  text: string,
  context: string | string[],
  options?: Partial<GroundednessCheckOptions>
): Promise<GroundednessResult & { analysis?: string }> {
  const result = await checkGroundedness({
    text,
    context,
    ...options,
  });

  return result;
}
