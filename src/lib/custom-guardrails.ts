import type { OpenAIGuardrailsFormat, OpenAIGuardrail, ValidationResult } from '@/types/guardrails';

/**
 * Custom Guardrails Validator for OpenAI Guardrails Format
 *
 * IMPLEMENTATION STATUS:
 * ✅ PII Detection - FULLY IMPLEMENTED (regex-based entity detection)
 * ⚠️  Moderation - PLACEHOLDER (returns valid, needs OpenAI API integration)
 * ⚠️  Jailbreak Detection - PLACEHOLDER (returns valid, needs LLM-based detection)
 * ⚠️  Off-Topic Prompts - PLACEHOLDER (returns valid, needs LLM-based detection)
 * ⚠️  Custom Prompt Check - PLACEHOLDER (returns valid, needs LLM-based detection)
 *
 * Note: Moderation and LLM-based guardrails require API calls to OpenAI's Guardrails API
 * or custom LLM implementations, which are not included in this basic implementation.
 */

const PII_PATTERNS: Record<string, RegExp> = {
  'EMAIL_ADDRESS': /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  'PHONE_NUMBER': /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  'CREDIT_CARD': /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  'URL': /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
  'IP_ADDRESS': /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  'DATE_TIME': /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/g,
};

function checkPIIEntities(text: string, entities: string[]): { found: string[]; matches: Record<string, number> } {
  const found: string[] = [];
  const matches: Record<string, number> = {};

  for (const entity of entities) {
    const pattern = PII_PATTERNS[entity];
    if (pattern) {
      const entityMatches = text.match(pattern);
      if (entityMatches && entityMatches.length > 0) {
        found.push(entity);
        matches[entity] = entityMatches.length;
      }
    }
  }

  return { found, matches };
}

function validatePIIGuardrail(text: string, guardrail: OpenAIGuardrail): { valid: boolean; violations: string[] } {
  const { entities } = guardrail.config;

  if (!entities || entities.length === 0) {
    return { valid: true, violations: [] };
  }

  console.log(`[Custom Guardrails] PII Detection "${guardrail.name}" executed (FULLY IMPLEMENTED)`);
  console.log(`[Custom Guardrails] Checking for entities:`, entities);

  const { found, matches } = checkPIIEntities(text, entities);

  if (found.length > 0) {
    console.log(`[Custom Guardrails] PII DETECTED:`, found);
    const violations = found.map(entity =>
      `[${guardrail.name}] Detected ${entity} (${matches[entity]} occurrence${matches[entity] > 1 ? 's' : ''})`
    );
    return { valid: false, violations };
  }

  console.log(`[Custom Guardrails] No PII detected - PASSED`);
  return { valid: true, violations: [] };
}

function validateModerationGuardrail(text: string, guardrail: OpenAIGuardrail): { valid: boolean; violations: string[] } {
  const { categories } = guardrail.config;

  if (!categories || categories.length === 0) {
    return { valid: true, violations: [] };
  }

  console.log(`[Custom Guardrails] Moderation guardrail "${guardrail.name}" executed (PLACEHOLDER - always passes)`);
  console.log(`[Custom Guardrails] Categories configured:`, categories);

  return { valid: true, violations: [] };
}

function validateCustomPromptCheck(text: string, guardrail: OpenAIGuardrail): { valid: boolean; violations: string[] } {
  const { system_prompt_details, confidence_threshold } = guardrail.config;

  if (!system_prompt_details) {
    return { valid: true, violations: [] };
  }

  console.log(`[Custom Guardrails] Custom prompt check "${guardrail.name}" executed (PLACEHOLDER - always passes)`);
  console.log(`[Custom Guardrails] Config:`, { system_prompt_details, confidence_threshold });

  return { valid: true, violations: [] };
}

function validateGuardrail(text: string, guardrail: OpenAIGuardrail): { valid: boolean; violations: string[] } {
  const guardrailName = guardrail.name.toLowerCase();

  if (guardrailName.includes('pii')) {
    return validatePIIGuardrail(text, guardrail);
  }

  if (guardrailName.includes('moderation')) {
    return validateModerationGuardrail(text, guardrail);
  }

  if (guardrailName.includes('jailbreak') || guardrailName.includes('off topic') || guardrailName.includes('custom prompt')) {
    return validateCustomPromptCheck(text, guardrail);
  }

  return { valid: true, violations: [] };
}

export function validateCustomGuardrails(
  text: string,
  guardrailsFormat: OpenAIGuardrailsFormat,
  context: 'input' | 'output'
): ValidationResult {
  const violations: string[] = [];
  const details: Record<string, any> = {
    executedGuardrails: [],
    guardrailResults: {},
  };

  if (guardrailsFormat.pre_flight && guardrailsFormat.pre_flight.guardrails) {
    for (const guardrail of guardrailsFormat.pre_flight.guardrails) {
      details.executedGuardrails.push(`pre_flight:${guardrail.name}`);
      const result = validateGuardrail(text, guardrail);

      details.guardrailResults[`pre_flight:${guardrail.name}`] = {
        passed: result.valid,
        violations: result.violations,
        config: guardrail.config,
      };

      if (!result.valid) {
        violations.push(...result.violations);
        details[`pre_flight:${guardrail.name}`] = result.violations;
      }
    }
  }

  const contextSection = context === 'input' ? guardrailsFormat.input : guardrailsFormat.output;

  if (contextSection && contextSection.guardrails) {
    for (const guardrail of contextSection.guardrails) {
      details.executedGuardrails.push(`${context}:${guardrail.name}`);
      const result = validateGuardrail(text, guardrail);

      details.guardrailResults[`${context}:${guardrail.name}`] = {
        passed: result.valid,
        violations: result.violations,
        config: guardrail.config,
      };

      if (!result.valid) {
        violations.push(...result.violations);
        details[`${context}:${guardrail.name}`] = result.violations;
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations,
    details,
  };
}

export function parseCustomGuardrailsJSON(jsonString: string): OpenAIGuardrailsFormat {
  try {
    const parsed = JSON.parse(jsonString);

    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Guardrails must be a JSON object');
    }

    if (!parsed.version) {
      throw new Error('Missing required "version" field');
    }

    if (parsed.pre_flight && !parsed.pre_flight.guardrails) {
      throw new Error('pre_flight section must have a "guardrails" array');
    }

    if (parsed.input && !parsed.input.guardrails) {
      throw new Error('input section must have a "guardrails" array');
    }

    if (parsed.output && !parsed.output.guardrails) {
      throw new Error('output section must have a "guardrails" array');
    }

    return parsed as OpenAIGuardrailsFormat;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
    throw new Error('Invalid JSON format');
  }
}

export const DEFAULT_CUSTOM_GUARDRAILS_EXAMPLE = JSON.stringify({
  "version": 1,
  "pre_flight": {
    "version": 1,
    "guardrails": [
      {
        "name": "Contains PII",
        "config": {
          "entities": [
            "CREDIT_CARD",
            "EMAIL_ADDRESS",
            "IP_ADDRESS",
            "PHONE_NUMBER",
            "URL"
          ]
        }
      }
    ]
  },
  "input": {
    "version": 1,
    "guardrails": [
      {
        "name": "Custom Prompt Check",
        "config": {
          "confidence_threshold": 0.7,
          "model": "gpt-4o-mini",
          "system_prompt_details": "You are an email writer for the eversports manager tool. Only accept prompts that adhere to writing an email, do not answer questions in the topics of: finances, business metrics, competitors research."
        }
      }
    ]
  },
  "output": {
    "version": 1,
    "guardrails": []
  }
}, null, 2);
