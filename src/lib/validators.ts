import type { CustomValidatorsConfig, ValidationResult } from '@/types/guardrails';

const PROFANITY_LIST = [
  'damn', 'hell', 'crap', 'shit', 'fuck', 'ass', 'bitch', 'bastard',
  'dick', 'pussy', 'cock', 'piss', 'retard', 'slut', 'whore'
];

const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  address: /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir)\b/gi,
};

function checkProfanity(text: string): { hasProfanity: boolean; matches: string[] } {
  const lowerText = text.toLowerCase();
  const matches: string[] = [];

  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(lowerText)) {
      matches.push(word);
    }
  }

  return {
    hasProfanity: matches.length > 0,
    matches,
  };
}

function checkPII(text: string): { hasPII: boolean; types: string[] } {
  const foundTypes: string[] = [];

  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    if (pattern.test(text)) {
      foundTypes.push(type);
    }
  }

  return {
    hasPII: foundTypes.length > 0,
    types: foundTypes,
  };
}

function checkEmailStructure(text: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const lowerText = text.toLowerCase();

  const hasGreeting = /^(dear|hello|hi|hey|greetings|good morning|good afternoon)/i.test(text.trim());
  if (!hasGreeting) {
    issues.push('Missing proper greeting');
  }

  const hasClosing = /(sincerely|regards|best|thanks|thank you|cheers|yours|respectfully)/i.test(text);
  if (!hasClosing) {
    issues.push('Missing proper closing');
  }

  const hasSalutation = /(sincerely|regards|best regards|warm regards|kind regards|thank you|thanks|cheers)/i.test(lowerText);
  if (!hasSalutation) {
    issues.push('Missing professional salutation');
  }

  const wordCount = text.split(/\s+/).length;
  if (wordCount < 20) {
    issues.push('Email is too short (less than 20 words)');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

function checkLength(text: string, minWords: number = 20, maxWords: number = 500): { valid: boolean; wordCount: number } {
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  return {
    valid: wordCount >= minWords && wordCount <= maxWords,
    wordCount,
  };
}

function checkCustomRules(text: string): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  if (text.includes('URGENT') || text.includes('ACT NOW')) {
    violations.push('Contains spam-like urgent language');
  }

  if (text.match(/\$\d+/g) && text.toLowerCase().includes('million')) {
    violations.push('Contains suspicious financial claims');
  }

  const capsCount = (text.match(/[A-Z]/g) || []).length;
  const totalLetters = (text.match(/[a-zA-Z]/g) || []).length;
  if (totalLetters > 0 && capsCount / totalLetters > 0.3) {
    violations.push('Excessive use of capital letters');
  }

  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount > 5) {
    violations.push('Excessive use of exclamation marks');
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

export function validateContent(
  text: string,
  config: CustomValidatorsConfig,
  context: 'input' | 'output' = 'output'
): ValidationResult {
  const violations: string[] = [];
  const details: Record<string, any> = {};

  if (config.checkProfanity) {
    const profanityCheck = checkProfanity(text);
    if (profanityCheck.hasProfanity) {
      violations.push(`Contains profanity: ${profanityCheck.matches.join(', ')}`);
      details.profanity = profanityCheck.matches;
    }
  }

  if (config.checkPII) {
    const piiCheck = checkPII(text);
    if (piiCheck.hasPII) {
      violations.push(`Contains PII (${piiCheck.types.join(', ')})`);
      details.pii = piiCheck.types;
    }
  }

  if (config.checkStructure && context === 'output') {
    const structureCheck = checkEmailStructure(text);
    if (!structureCheck.valid) {
      violations.push(...structureCheck.issues);
      details.structure = structureCheck.issues;
    }
  }

  if (config.checkLength) {
    const lengthCheck = checkLength(text);
    if (!lengthCheck.valid) {
      violations.push(
        `Email length is ${lengthCheck.wordCount} words (should be between 20-500 words)`
      );
      details.wordCount = lengthCheck.wordCount;
    }
  }

  if (config.customRules) {
    const customCheck = checkCustomRules(text);
    if (!customCheck.valid) {
      violations.push(...customCheck.violations);
      details.customRules = customCheck.violations;
    }
  }

  return {
    valid: violations.length === 0,
    violations,
    details,
  };
}
