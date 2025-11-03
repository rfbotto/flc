import OpenAI from 'openai';
import type { ModerationConfig, ModerationResult } from '@/types/guardrails';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function moderateContent(
  content: string,
  config?: ModerationConfig
): Promise<ModerationResult> {
  try {
    const moderation = await openai.moderations.create({
      input: content,
    });

    const result = moderation.results[0];

    if (!config) {
      return {
        flagged: result.flagged,
        categories: result.categories as any,
        category_scores: result.category_scores as any,
      };
    }

    const { enabledCategories, thresholds } = config;
    let flagged = false;
    let violationType: string | undefined;

    if (enabledCategories.hate) {
      const hateScore = Math.max(
        result.category_scores.hate,
        result.category_scores['hate/threatening']
      );
      if (hateScore >= thresholds.hate) {
        flagged = true;
        violationType = 'hate speech';
      }
    }

    if (enabledCategories.harassment) {
      const harassmentScore = Math.max(
        result.category_scores.harassment,
        result.category_scores['harassment/threatening']
      );
      if (harassmentScore >= thresholds.harassment) {
        flagged = true;
        violationType = violationType ? `${violationType}, harassment` : 'harassment';
      }
    }

    if (enabledCategories.selfHarm) {
      const selfHarmScore = Math.max(
        result.category_scores['self-harm'],
        result.category_scores['self-harm/intent'],
        result.category_scores['self-harm/instructions']
      );
      if (selfHarmScore >= thresholds.selfHarm) {
        flagged = true;
        violationType = violationType ? `${violationType}, self-harm` : 'self-harm content';
      }
    }

    if (enabledCategories.sexual) {
      const sexualScore = Math.max(
        result.category_scores.sexual,
        result.category_scores['sexual/minors']
      );
      if (sexualScore >= thresholds.sexual) {
        flagged = true;
        violationType = violationType ? `${violationType}, sexual content` : 'sexual content';
      }
    }

    if (enabledCategories.violence) {
      const violenceScore = Math.max(
        result.category_scores.violence,
        result.category_scores['violence/graphic']
      );
      if (violenceScore >= thresholds.violence) {
        flagged = true;
        violationType = violationType ? `${violationType}, violence` : 'violent content';
      }
    }

    return {
      flagged,
      categories: result.categories as any,
      category_scores: result.category_scores as any,
      violation_type: violationType,
    };
  } catch (error) {
    console.error('Moderation error:', error);
    throw new Error('Failed to moderate content');
  }
}

export function formatModerationScores(scores: Record<string, number>): string {
  return Object.entries(scores)
    .map(([category, score]) => `${category}: ${(score * 100).toFixed(2)}%`)
    .join(', ');
}

export function getHighestScoringCategory(scores: Record<string, number>): {
  category: string;
  score: number;
} {
  let highestCategory = '';
  let highestScore = 0;

  for (const [category, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      highestCategory = category;
    }
  }

  return { category: highestCategory, score: highestScore };
}
