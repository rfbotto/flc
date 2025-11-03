"use client";

import { useState } from "react";
import type { GuardrailsConfig } from "@/types/guardrails";

interface EmailConfig {
  tone: string;
  length: string;
  includeCallToAction: boolean;
  formalityLevel: string;
  brandVoice: string;
}

const MODERATION_DESCRIPTIONS: Record<string, { title: string; description: string }> = {
  hate: {
    title: "Hate Speech",
    description: "Detects content that expresses, incites, or promotes hate based on race, gender, ethnicity, religion, nationality, sexual orientation, disability status, or caste."
  },
  harassment: {
    title: "Harassment",
    description: "Identifies content that expresses, incites, or promotes harassing language towards any target, including threats, intimidation, or bullying."
  },
  selfHarm: {
    title: "Self-Harm",
    description: "Catches content that promotes, encourages, or depicts acts of self-harm (suicide, cutting, eating disorders)."
  },
  sexual: {
    title: "Sexual Content",
    description: "Flags content meant to arouse sexual excitement, or that describes sexual activity in explicit detail."
  },
  violence: {
    title: "Violence",
    description: "Detects content that depicts death, violence, or physical injury in graphic detail, or promotes/glorifies violence."
  }
};

const VALIDATOR_DESCRIPTIONS: Record<string, { title: string; description: string; checks: string[] }> = {
  checkProfanity: {
    title: "Profanity Filter",
    description: "Scans for common profane and offensive words",
    checks: ["Detects swear words and explicit language", "Catches variations and common misspellings"]
  },
  checkPII: {
    title: "PII Detection",
    description: "Identifies personally identifiable information that shouldn't be in emails",
    checks: ["Email addresses", "Phone numbers (xxx-xxx-xxxx)", "Social security numbers", "Credit card numbers", "Street addresses"]
  },
  checkStructure: {
    title: "Email Structure",
    description: "Ensures generated emails follow professional format (OUTPUT ONLY)",
    checks: ["Has proper greeting (Dear, Hello, Hi)", "Includes professional closing (Sincerely, Regards)", "Contains meaningful body content (20+ words)", "Has appropriate salutation"]
  },
  checkLength: {
    title: "Length Validation",
    description: "Enforces reasonable email length (OUTPUT ONLY)",
    checks: ["Minimum 20 words", "Maximum 500 words", "Prevents too-short or too-long emails", "Does not apply to your input description"]
  },
  customRules: {
    title: "Custom Business Rules",
    description: "Additional business-specific content policies",
    checks: ["Blocks spam-like language (URGENT, ACT NOW)", "Flags suspicious financial claims", "Detects excessive capitals (>30% of text)", "Limits exclamation marks (max 5)"]
  }
};

export default function PlaygroundPage() {
  const [userInput, setUserInput] = useState("");
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    tone: "professional",
    length: "medium",
    includeCallToAction: false,
    formalityLevel: "balanced",
    brandVoice: "",
  });

  const [guardrailsEnabled, setGuardrailsEnabled] = useState(true);
  const [guardrailsConfig, setGuardrailsConfig] = useState<GuardrailsConfig>({
    enabledCategories: {
      hate: true,
      harassment: true,
      selfHarm: true,
      sexual: true,
      violence: true,
    },
    thresholds: {
      hate: 0.5,
      harassment: 0.5,
      selfHarm: 0.5,
      sexual: 0.5,
      violence: 0.5,
    },
    validators: {
      checkProfanity: true,
      checkPII: true,
      checkStructure: true,
      checkLength: true,
      customRules: true,
    },
  });

  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(true);

  const handleGenerate = async () => {
    if (!userInput.trim()) {
      setError({
        error: "Validation Error",
        message: "Please enter an email description",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedEmail("");
    setDebugInfo(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput,
          emailConfig,
          guardrailsConfig: guardrailsEnabled ? guardrailsConfig : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data);
        setDebugInfo(data.moderationResult || data);
        return;
      }

      setGeneratedEmail(data.generatedEmail);
      setDebugInfo(data.debugInfo);
    } catch (err: any) {
      setError({
        error: "Network Error",
        message: err.message || "An error occurred while generating the email",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedEmail);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    } catch (err) {
      setError({ error: "Copy Error", message: "Failed to copy to clipboard" });
    }
  };

  const handleClear = () => {
    setGeneratedEmail("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            AI Email Generation Playground
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Experimental tool with advanced guardrails for exploring AI-powered
            email generation
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-7 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label
                htmlFor="email-description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Description
              </label>
              <textarea
                id="email-description"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Describe the email you want to send (e.g., 'Notify customers about our holiday sale with 20% off all products')"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              {userInput.trim() && userInput.trim().split(/\s+/).length < 5 && (
                <div className="mt-2 flex items-start gap-2 p-2 bg-blue-50 rounded-md">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-blue-700">
                    <strong>Tip:</strong> More detailed descriptions often produce better results. Try adding context like tone, audience, or key points to include.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Generating..." : "Generate Email"}
            </button>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Generated Email
                </h2>
                {generatedEmail && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Copy
                    </button>
                    <button
                      onClick={handleClear}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {error.error}
                      </h3>
                      <p className="mt-1 text-sm text-red-700">
                        {error.message}
                      </p>
                      {error.violations && (
                        <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                          {error.violations.map(
                            (violation: string, index: number) => (
                              <li key={index}>{violation}</li>
                            ),
                          )}
                        </ul>
                      )}
                      {error.stage && (
                        <p className="mt-2 text-xs text-red-600">
                          Blocked at:{" "}
                          {error.stage === "input"
                            ? "Input Filtering"
                            : "Output Filtering"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {generatedEmail && !isLoading && (
                <div className="bg-gray-50 rounded-md p-4 min-h-[300px]">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans">
                    {generatedEmail}
                  </pre>
                </div>
              )}

              {!generatedEmail && !isLoading && !error && (
                <div className="bg-gray-50 rounded-md p-4 min-h-[300px] flex items-center justify-center">
                  <p className="text-gray-500 text-sm">
                    Generated email will appear here
                  </p>
                </div>
              )}
            </div>

            {debugInfo && showDebugPanel && (
              <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Debug Information
                  </h2>
                  <button
                    onClick={() => setShowDebugPanel(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {debugInfo.allChecksPassed && (
                  <div className="mb-4 bg-green-50 rounded-md p-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-green-800 font-medium">All guardrails passed!</p>
                  </div>
                )}

                {(debugInfo.inputScores || debugInfo.category_scores) && (
                  <div className="space-y-4">
                    {debugInfo.inputScores && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Input Moderation Scores
                        </h3>
                        <div className="space-y-2 pl-4">
                          {Object.entries(debugInfo.inputScores).map(([category, score]: [string, any]) => (
                            <div key={category} className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">{category}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${score > 0.5 ? 'bg-red-500' : score > 0.3 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                    style={{ width: `${Math.min(score * 100, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-mono text-gray-700 w-12 text-right">
                                  {(score * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {debugInfo.outputScores && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          Output Moderation Scores
                        </h3>
                        <div className="space-y-2 pl-4">
                          {Object.entries(debugInfo.outputScores).map(([category, score]: [string, any]) => (
                            <div key={category} className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">{category}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${score > 0.5 ? 'bg-red-500' : score > 0.3 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                    style={{ width: `${Math.min(score * 100, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-mono text-gray-700 w-12 text-right">
                                  {(score * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {debugInfo.category_scores && !debugInfo.inputScores && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Moderation Scores</h3>
                        <div className="space-y-2">
                          {Object.entries(debugInfo.category_scores).map(([category, score]: [string, any]) => (
                            <div key={category} className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">{category}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${score > 0.5 ? 'bg-red-500' : score > 0.3 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                    style={{ width: `${Math.min(score * 100, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-mono text-gray-700 w-12 text-right">
                                  {(score * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {debugInfo.violations && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Validation Violations</h3>
                    <ul className="space-y-1">
                      {debugInfo.violations.map((violation: string, index: number) => (
                        <li key={index} className="text-xs text-red-600 flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span>{violation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {debugInfo.message && (
                  <div className="mt-4 bg-blue-50 rounded-md p-3">
                    <p className="text-xs text-blue-800">{debugInfo.message}</p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    <strong>How to read scores:</strong> Green (&lt;30%) = Safe, Yellow (30-50%) = Borderline, Red (&gt;50%) = Flagged
                  </p>
                </div>
              </div>
            )}

            {!showDebugPanel && debugInfo && (
              <button
                onClick={() => setShowDebugPanel(true)}
                className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Show Debug Information
              </button>
            )}
          </div>

          <div className="xl:col-span-5 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Email Settings
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="tone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tone
                  </label>
                  <select
                    id="tone"
                    value={emailConfig.tone}
                    onChange={(e) =>
                      setEmailConfig({ ...emailConfig, tone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                    <option value="casual">Casual</option>
                    <option value="enthusiastic">Enthusiastic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Length
                  </label>
                  <div className="space-y-2">
                    {["short", "medium", "long"].map((len) => (
                      <label key={len} className="flex items-center">
                        <input
                          type="radio"
                          value={len}
                          checked={emailConfig.length === len}
                          onChange={(e) =>
                            setEmailConfig({
                              ...emailConfig,
                              length: e.target.value,
                            })
                          }
                          className="mr-2 text-blue-600"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {len} (~
                          {len === "short"
                            ? "100"
                            : len === "medium"
                              ? "200"
                              : "300"}{" "}
                          words)
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={emailConfig.includeCallToAction}
                      onChange={(e) =>
                        setEmailConfig({
                          ...emailConfig,
                          includeCallToAction: e.target.checked,
                        })
                      }
                      className="mr-2 rounded text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Include Call-to-Action
                    </span>
                  </label>
                </div>

                <div>
                  <label
                    htmlFor="formality"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Formality Level
                  </label>
                  <select
                    id="formality"
                    value={emailConfig.formalityLevel}
                    onChange={(e) =>
                      setEmailConfig({
                        ...emailConfig,
                        formalityLevel: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm"
                  >
                    <option value="casual">Casual</option>
                    <option value="balanced">Balanced</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="brandVoice"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Brand Voice (Optional)
                  </label>
                  <input
                    type="text"
                    id="brandVoice"
                    value={emailConfig.brandVoice}
                    onChange={(e) =>
                      setEmailConfig({
                        ...emailConfig,
                        brandVoice: e.target.value,
                      })
                    }
                    placeholder="e.g., innovative, customer-focused"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-sm p-6 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Advanced Guardrails
                  </h2>
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                    Experimental
                  </span>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guardrailsEnabled}
                    onChange={(e) => setGuardrailsEnabled(e.target.checked)}
                    className="mr-2 rounded text-purple-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Enable
                  </span>
                </label>
              </div>

              {guardrailsEnabled && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900">
                        OpenAI Moderation
                      </h3>
                      <span className="text-xs text-gray-500">Powered by OpenAI</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">
                      Uses OpenAI's moderation API to detect harmful content. Adjust thresholds (0-100%) to control sensitivity.
                    </p>
                    <div className="space-y-4">
                      {Object.keys(guardrailsConfig.enabledCategories).map(
                        (category) => {
                          const desc = MODERATION_DESCRIPTIONS[category];
                          return (
                            <div key={category} className="bg-white rounded-lg p-3 border border-purple-100">
                              <div className="flex items-start justify-between mb-2">
                                <label className="flex items-start flex-1">
                                  <input
                                    type="checkbox"
                                    checked={
                                      guardrailsConfig.enabledCategories[
                                        category as keyof typeof guardrailsConfig.enabledCategories
                                      ]
                                    }
                                    onChange={(e) =>
                                      setGuardrailsConfig({
                                        ...guardrailsConfig,
                                        enabledCategories: {
                                          ...guardrailsConfig.enabledCategories,
                                          [category]: e.target.checked,
                                        },
                                      })
                                    }
                                    className="mr-2 mt-0.5 rounded text-purple-600"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm font-medium text-gray-900">
                                        {desc?.title || category}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {desc?.description}
                                    </p>
                                  </div>
                                </label>
                                <span className="text-xs font-medium text-purple-600 ml-2">
                                  {(
                                    guardrailsConfig.thresholds[
                                      category as keyof typeof guardrailsConfig.thresholds
                                    ] * 100
                                  ).toFixed(0)}
                                  %
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-gray-500">Low</span>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={
                                    guardrailsConfig.thresholds[
                                      category as keyof typeof guardrailsConfig.thresholds
                                    ] * 100
                                  }
                                  onChange={(e) =>
                                    setGuardrailsConfig({
                                      ...guardrailsConfig,
                                      thresholds: {
                                        ...guardrailsConfig.thresholds,
                                        [category]: parseInt(e.target.value) / 100,
                                      },
                                    })
                                  }
                                  className="flex-1 h-2 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-xs text-gray-500">High</span>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <div className="border-t border-purple-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Custom Validators
                      </h3>
                      <span className="text-xs text-gray-500">Business Rules</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">
                      Additional validation rules specific to email quality and compliance.
                    </p>
                    <div className="space-y-3">
                      {Object.keys(guardrailsConfig.validators).map(
                        (validator) => {
                          const desc = VALIDATOR_DESCRIPTIONS[validator];
                          return (
                            <div key={validator} className="bg-white rounded-lg p-3 border border-purple-100">
                              <label className="flex items-start">
                                <input
                                  type="checkbox"
                                  checked={
                                    guardrailsConfig.validators[
                                      validator as keyof typeof guardrailsConfig.validators
                                    ]
                                  }
                                  onChange={(e) =>
                                    setGuardrailsConfig({
                                      ...guardrailsConfig,
                                      validators: {
                                        ...guardrailsConfig.validators,
                                        [validator]: e.target.checked,
                                      },
                                    })
                                  }
                                  className="mr-2 mt-0.5 rounded text-purple-600"
                                />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {desc?.title || validator}
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {desc?.description}
                                  </p>
                                  {desc?.checks && (
                                    <ul className="mt-2 space-y-0.5">
                                      {desc.checks.map((check, idx) => (
                                        <li key={idx} className="text-xs text-gray-500 flex items-start gap-1">
                                          <span className="text-purple-400 mt-0.5">▪</span>
                                          <span>{check}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </label>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <div className="bg-purple-100 rounded-md p-3 mt-4">
                    <p className="text-xs text-purple-800">
                      <strong>How it works:</strong> All validators check your input description for inappropriate content.
                      Email Structure and Length Validation only check the generated output (marked as "OUTPUT ONLY").
                      Your input can be brief—just a few words is fine!
                    </p>
                  </div>
                </div>
              )}

              {!guardrailsEnabled && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    Enable guardrails to experiment with content filtering
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCopyToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-md shadow-lg animate-fade-in">
          Copied to clipboard!
        </div>
      )}
    </div>
  );
}
