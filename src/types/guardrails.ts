export interface ModerationCategory {
  hate: boolean;
  'hate/threatening': boolean;
  harassment: boolean;
  'harassment/threatening': boolean;
  'self-harm': boolean;
  'self-harm/intent': boolean;
  'self-harm/instructions': boolean;
  sexual: boolean;
  'sexual/minors': boolean;
  violence: boolean;
  'violence/graphic': boolean;
}

export interface ModerationScores {
  hate: number;
  'hate/threatening': number;
  harassment: number;
  'harassment/threatening': number;
  'self-harm': number;
  'self-harm/intent': number;
  'self-harm/instructions': number;
  sexual: number;
  'sexual/minors': number;
  violence: number;
  'violence/graphic': number;
}

export interface ModerationResult {
  flagged: boolean;
  categories: ModerationCategory;
  category_scores: ModerationScores;
  violation_type?: string;
}

export interface ModerationConfig {
  enabledCategories: {
    hate: boolean;
    harassment: boolean;
    selfHarm: boolean;
    sexual: boolean;
    violence: boolean;
  };
  thresholds: {
    hate: number;
    harassment: number;
    selfHarm: number;
    sexual: number;
    violence: number;
  };
}

export interface CustomValidatorsConfig {
  checkProfanity: boolean;
  checkPII: boolean;
  checkStructure: boolean;
  checkLength: boolean;
  customRules: boolean;
}

export interface ValidationResult {
  valid: boolean;
  violations: string[];
  details?: Record<string, any>;
}

export interface GuardrailsConfig extends ModerationConfig {
  validators: CustomValidatorsConfig;
}

export interface GuardrailsResponse {
  passed: boolean;
  inputModeration?: ModerationResult;
  outputModeration?: ModerationResult;
  validationErrors: string[];
  metadata?: Record<string, any>;
}
