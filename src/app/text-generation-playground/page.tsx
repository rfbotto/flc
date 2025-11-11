"use client";

import { useState } from "react";
import type {
  GuardrailsConfig,
  OpenAIGuardrailsFormat,
} from "@/types/guardrails";
import { DEFAULT_CUSTOM_GUARDRAILS_EXAMPLE } from "@/lib/custom-guardrails";

interface EmailConfig {
  tone: string;
  length: string;
  includeCallToAction: boolean;
  formalityLevel: string;
  brandVoice: string;
}

const MODERATION_DESCRIPTIONS: Record<
  string,
  { title: string; description: string }
> = {
  hate: {
    title: "Hate Speech",
    description:
      "Detects content that expresses, incites, or promotes hate based on race, gender, ethnicity, religion, nationality, sexual orientation, disability status, or caste.",
  },
  harassment: {
    title: "Harassment",
    description:
      "Identifies content that expresses, incites, or promotes harassing language towards any target, including threats, intimidation, or bullying.",
  },
  selfHarm: {
    title: "Self-Harm",
    description:
      "Catches content that promotes, encourages, or depicts acts of self-harm (suicide, cutting, eating disorders).",
  },
  sexual: {
    title: "Sexual Content",
    description:
      "Flags content meant to arouse sexual excitement, or that describes sexual activity in explicit detail.",
  },
  violence: {
    title: "Violence",
    description:
      "Detects content that depicts death, violence, or physical injury in graphic detail, or promotes/glorifies violence.",
  },
};

const VALIDATOR_DESCRIPTIONS: Record<
  string,
  { title: string; description: string; checks: string[] }
> = {
  checkProfanity: {
    title: "Profanity Filter",
    description: "Scans for common profane and offensive words",
    checks: [
      "Detects swear words and explicit language",
      "Catches variations and common misspellings",
    ],
  },
  checkPII: {
    title: "PII Detection",
    description:
      "Identifies personally identifiable information that shouldn't be in emails",
    checks: [
      "Email addresses",
      "Phone numbers (xxx-xxx-xxxx)",
      "Social security numbers",
      "Credit card numbers",
      "Street addresses",
    ],
  },
  customRules: {
    title: "Custom Business Rules",
    description: "Additional business-specific content policies",
    checks: [
      "Blocks spam-like language (URGENT, ACT NOW)",
      "Flags suspicious financial claims",
      "Detects excessive capitals (>30% of text)",
    ],
  },
};

const DEFAULT_CONTEXT =
  "You are generating content for a professional business environment.";

export default function PlaygroundPage() {
  const [userInput, setUserInput] = useState("");
  const [context, setContext] = useState("");
  const [contextSources, setContextSources] = useState<string[]>([]);
  const [contextSourceInput, setContextSourceInput] = useState("");
  const [customSystemPrompt, setCustomSystemPrompt] = useState("");
  const [useCustomSystemPrompt, setUseCustomSystemPrompt] = useState(false);
  const [customGuardrailsJSON, setCustomGuardrailsJSON] = useState("");
  const [customGuardrailsError, setCustomGuardrailsError] = useState("");
  const [emailSettingsEnabled, setEmailSettingsEnabled] = useState(true);
  const [showRequestFlow, setShowRequestFlow] = useState(true);
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

    let customGuardrails: OpenAIGuardrailsFormat | undefined;
    if (customGuardrailsJSON.trim()) {
      try {
        const parsed = JSON.parse(customGuardrailsJSON);

        if (!parsed || typeof parsed !== "object") {
          throw new Error("Guardrails must be a JSON object");
        }

        if (!parsed.version) {
          throw new Error('Missing required "version" field');
        }

        customGuardrails = parsed as OpenAIGuardrailsFormat;
        setCustomGuardrailsError("");
      } catch (err) {
        setError({
          error: "Invalid JSON",
          message:
            err instanceof Error
              ? err.message
              : "Custom guardrails JSON is malformed. Please check your syntax.",
        });
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput,
          emailConfig: emailSettingsEnabled ? emailConfig : undefined,
          guardrailsConfig: guardrailsEnabled ? guardrailsConfig : undefined,
          context: context.trim() || undefined,
          customSystemPrompt:
            useCustomSystemPrompt && customSystemPrompt.trim()
              ? customSystemPrompt
              : undefined,
          customGuardrails,
          contextSources: contextSources.length > 0 ? contextSources : undefined,
        }),
      });

      const responseText = await response.text();
      let data;

      try {
        if (!responseText) {
          throw new Error("Server returned empty response");
        }
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response:", responseText);
        setError({
          error: "Parse Error",
          message: `Received invalid response from server: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
        });
        return;
      }

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

  const getSystemPromptPreview = () => {
    if (useCustomSystemPrompt && customSystemPrompt.trim()) {
      return customSystemPrompt;
    }

    if (!emailSettingsEnabled) {
      return "You are a helpful AI assistant that generates professional email content based on user descriptions.";
    }

    const lengthGuidelines: Record<string, string> = {
      short: "approximately 100 words",
      medium: "approximately 200 words",
      long: "approximately 300 words",
    };

    return `You are a professional email writer. Generate an email based on the user's description with these specifications:
- Tone: ${emailConfig.tone}
- Length: ${lengthGuidelines[emailConfig.length] || "medium length"}
- Formality: ${emailConfig.formalityLevel}
${emailConfig.includeCallToAction ? "- Include a clear call-to-action at the end" : ""}
${emailConfig.brandVoice ? `- Brand voice: ${emailConfig.brandVoice}` : ""}

Create a complete, ready-to-send email with proper greeting, body, and signature. Do not include a subject line. Format the email professionally.`;
  };

  const getContextPreview = () => {
    return context.trim() || DEFAULT_CONTEXT;
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
                  <svg
                    className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-xs text-blue-700">
                    <strong>Tip:</strong> More detailed descriptions often
                    produce better results. Try adding context like tone,
                    audience, or key points to include.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <label
                htmlFor="context"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Context (Optional)
              </label>
              <textarea
                id="context"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder={DEFAULT_CONTEXT}
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Provide additional background information or context for the AI
                to consider (e.g., company info, previous email thread, or
                specific requirements).
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <label
                htmlFor="contextSources"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Context Sources for Groundedness Checking
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="contextSources"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Enter source material or facts to verify against..."
                    value={contextSourceInput}
                    onChange={(e) => setContextSourceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && contextSourceInput.trim()) {
                        setContextSources([...contextSources, contextSourceInput.trim()]);
                        setContextSourceInput("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (contextSourceInput.trim()) {
                        setContextSources([...contextSources, contextSourceInput.trim()]);
                        setContextSourceInput("");
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Add
                  </button>
                </div>
                {contextSources.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {contextSources.map((source, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        <span className="max-w-xs truncate">{source}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setContextSources(contextSources.filter((_, i) => i !== index));
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Add source material that the AI output should be grounded in. The groundedness guardrail will verify that generated content doesn&apos;t hallucinate facts not present in these sources.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg shadow-sm p-6 border-2 border-indigo-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Request Flow
                  </h2>
                  <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
                    Transparency
                  </span>
                </div>
                <button
                  onClick={() => setShowRequestFlow(!showRequestFlow)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {showRequestFlow ? "Hide" : "Show"}
                </button>
              </div>

              {showRequestFlow ? (
                <div className="space-y-4">
                  <p className="text-xs text-gray-600 mb-4">
                    This shows the complete processing flow and what the AI
                    model receives:
                  </p>

                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-400">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                          1
                        </span>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Context Processing
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${context.trim() ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                        >
                          {context.trim() ? "Custom" : "Default"}
                        </span>
                      </div>
                      <pre className="text-xs text-gray-700 bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                        {getContextPreview()}
                      </pre>
                    </div>

                    <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-400">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                          2
                        </span>
                        <h3 className="text-sm font-semibold text-gray-900">
                          User Input
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${userInput.trim() ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                        >
                          {userInput.trim()
                            ? `${userInput.trim().split(/\s+/).length} words`
                            : "Empty"}
                        </span>
                      </div>
                      <pre className="text-xs text-gray-700 bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                        {userInput || "(No input provided yet)"}
                      </pre>
                    </div>

                    <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-400">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                          3
                        </span>
                        <h3 className="text-sm font-semibold text-gray-900">
                          System Prompt
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${useCustomSystemPrompt ? "bg-orange-100 text-orange-800" : emailSettingsEnabled ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}`}
                        >
                          {useCustomSystemPrompt
                            ? "Custom Override"
                            : emailSettingsEnabled
                              ? "From Settings"
                              : "Basic"}
                        </span>
                      </div>
                      <pre className="text-xs text-gray-700 bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                        {getSystemPromptPreview()}
                      </pre>
                    </div>

                    <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-400">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                          4
                        </span>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Guardrails Validation
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${guardrailsEnabled ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-600"}`}
                        >
                          {guardrailsEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      {guardrailsEnabled ? (
                        <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded space-y-1">
                          <div className="font-medium text-gray-900">
                            Active Checks:
                          </div>
                          <div className="ml-3 space-y-1">
                            <div>
                              • OpenAI Moderation API:{" "}
                              {
                                Object.values(
                                  guardrailsConfig.enabledCategories,
                                ).filter(Boolean).length
                              }{" "}
                              categories
                            </div>
                            <div>
                              • Custom Validators:{" "}
                              {
                                Object.values(
                                  guardrailsConfig.validators,
                                ).filter(Boolean).length
                              }{" "}
                              rules
                            </div>
                            {customGuardrailsJSON.trim() && (
                              <div>• Custom Guardrails: ✓ JSON configured</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          No guardrails validation will be performed
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-400">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                          5
                        </span>
                        <h3 className="text-sm font-semibold text-gray-900">
                          AI Generation
                        </h3>
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                          gpt-4o-mini
                        </span>
                      </div>
                      <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                        <div className="font-medium text-gray-900 mb-1">
                          Model Parameters:
                        </div>
                        <div className="ml-3 space-y-1">
                          <div>• Temperature: 0.7</div>
                          <div>• Model: gpt-4o-mini</div>
                          <div>
                            • Context: {getContextPreview().length} chars
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-400">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                          6
                        </span>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Output Validation
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${guardrailsEnabled ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-600"}`}
                        >
                          {guardrailsEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      {guardrailsEnabled ? (
                        <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                          Generated content will be validated against the same
                          guardrails before being displayed.
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          Generated content will be shown without validation.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-indigo-100 rounded-md p-3 mt-4">
                    <p className="text-xs text-indigo-900">
                      <strong>Note:</strong> This view updates in real-time as
                      you modify settings. The actual API request will include
                      all these components in the order shown.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600">
                    Click "Show" to see the complete request processing flow
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
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Debug Information
                  </h2>
                  <button
                    onClick={() => setShowDebugPanel(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {debugInfo.allChecksPassed && (
                  <div className="mb-4 bg-green-50 rounded-md p-3 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-green-800 font-medium">
                      All guardrails passed!
                    </p>
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
                          {Object.entries(debugInfo.inputScores).map(
                            ([category, score]: [string, any]) => (
                              <div
                                key={category}
                                className="flex items-center justify-between"
                              >
                                <span className="text-xs text-gray-600">
                                  {category}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${score > 0.5 ? "bg-red-500" : score > 0.3 ? "bg-yellow-500" : "bg-green-500"}`}
                                      style={{
                                        width: `${Math.min(score * 100, 100)}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs font-mono text-gray-700 w-12 text-right">
                                    {(score * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            ),
                          )}
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
                          {Object.entries(debugInfo.outputScores).map(
                            ([category, score]: [string, any]) => (
                              <div
                                key={category}
                                className="flex items-center justify-between"
                              >
                                <span className="text-xs text-gray-600">
                                  {category}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${score > 0.5 ? "bg-red-500" : score > 0.3 ? "bg-yellow-500" : "bg-green-500"}`}
                                      style={{
                                        width: `${Math.min(score * 100, 100)}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs font-mono text-gray-700 w-12 text-right">
                                    {(score * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {debugInfo.category_scores && !debugInfo.inputScores && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                          Moderation Scores
                        </h3>
                        <div className="space-y-2">
                          {Object.entries(debugInfo.category_scores).map(
                            ([category, score]: [string, any]) => (
                              <div
                                key={category}
                                className="flex items-center justify-between"
                              >
                                <span className="text-xs text-gray-600">
                                  {category}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${score > 0.5 ? "bg-red-500" : score > 0.3 ? "bg-yellow-500" : "bg-green-500"}`}
                                      style={{
                                        width: `${Math.min(score * 100, 100)}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs font-mono text-gray-700 w-12 text-right">
                                    {(score * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {debugInfo.violations && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Validation Violations
                    </h3>
                    <ul className="space-y-1">
                      {debugInfo.violations.map(
                        (violation: string, index: number) => (
                          <li
                            key={index}
                            className="text-xs text-red-600 flex items-start gap-2"
                          >
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>{violation}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

                {debugInfo.message && (
                  <div className="mt-4 bg-blue-50 rounded-md p-3">
                    <p className="text-xs text-blue-800">{debugInfo.message}</p>
                  </div>
                )}

                {debugInfo.urlFetchResults && debugInfo.urlFetchResults.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      Web Content Fetched from URLs
                    </h3>
                    <div className="space-y-2">
                      {debugInfo.urlFetchResults.map((result: any, index: number) => (
                        <div key={index} className={`bg-gray-50 rounded p-3 text-xs border ${result.success ? 'border-green-200' : 'border-red-200'}`}>
                          <div className="flex items-start gap-2 mb-2">
                            <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 break-all">{result.url}</div>
                              {result.title && (
                                <div className="text-gray-600 mt-1">Title: {result.title}</div>
                              )}
                              {result.success && result.content && (
                                <div className="mt-2">
                                  <details>
                                    <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                                      View content ({result.content.length} chars)
                                    </summary>
                                    <div className="mt-2 p-2 bg-white rounded border border-gray-200 max-h-48 overflow-y-auto">
                                      <pre className="whitespace-pre-wrap text-xs text-gray-700">
                                        {result.content.substring(0, 1000)}{result.content.length > 1000 ? '...' : ''}
                                      </pre>
                                    </div>
                                  </details>
                                </div>
                              )}
                              {result.error && (
                                <div className="mt-1 text-red-600">Error: {result.error}</div>
                              )}
                              <div className="mt-1 text-gray-500">
                                Fetched at: {new Date(result.fetchedAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 bg-blue-50 rounded-md p-2">
                      <p className="text-xs text-blue-800">
                        <strong>Note:</strong> URLs detected in the context field were automatically fetched and their content was added to the AI context for generation.
                      </p>
                    </div>
                  </div>
                )}

                {(debugInfo.customGuardrailsInput || debugInfo.customGuardrailsOutput) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Custom Guardrails Execution
                    </h3>

                    {debugInfo.customGuardrailsInput?.details?.executedGuardrails && (
                      <div className="mb-3">
                        <h4 className="text-xs font-semibold text-gray-600 mb-2">Input Guardrails:</h4>
                        <div className="space-y-2">
                          {debugInfo.customGuardrailsInput.details.executedGuardrails.map((guardrailName: string) => {
                            const result = debugInfo.customGuardrailsInput.details.guardrailResults[guardrailName];
                            return (
                              <div key={guardrailName} className="bg-gray-50 rounded p-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${result.passed ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                  <span className="font-medium">{guardrailName}</span>
                                  <span className={`px-2 py-0.5 text-xs rounded ${result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {result.passed ? 'PASSED' : 'FAILED'}
                                  </span>
                                </div>
                                {result.violations && result.violations.length > 0 && (
                                  <div className="mt-1 ml-4 text-red-600">
                                    {result.violations.map((v: string, i: number) => (
                                      <div key={i}>• {v}</div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {debugInfo.customGuardrailsOutput?.details?.executedGuardrails && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-600 mb-2">Output Guardrails:</h4>
                        <div className="space-y-2">
                          {debugInfo.customGuardrailsOutput.details.executedGuardrails.map((guardrailName: string) => {
                            const result = debugInfo.customGuardrailsOutput.details.guardrailResults[guardrailName];
                            return (
                              <div key={guardrailName} className="bg-gray-50 rounded p-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${result.passed ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                  <span className="font-medium">{guardrailName}</span>
                                  <span className={`px-2 py-0.5 text-xs rounded ${result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {result.passed ? 'PASSED' : 'FAILED'}
                                  </span>
                                </div>
                                {result.violations && result.violations.length > 0 && (
                                  <div className="mt-1 ml-4 text-red-600">
                                    {result.violations.map((v: string, i: number) => (
                                      <div key={i}>• {v}</div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 bg-yellow-50 rounded-md p-2">
                      <p className="text-xs text-yellow-800">
                        <strong>Note:</strong> Only PII Detection is fully implemented. Other guardrails (Moderation, Jailbreak, Off-Topic, Custom Prompt Check) are placeholders that always pass. Check console logs for execution details.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    <strong>How to read scores:</strong> Green (&lt;30%) = Safe,
                    Yellow (30-50%) = Borderline, Red (&gt;50%) = Flagged
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Email Settings
                  </h2>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailSettingsEnabled}
                    onChange={(e) => setEmailSettingsEnabled(e.target.checked)}
                    className="mr-2 rounded text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Enable
                  </span>
                </label>
              </div>

              {emailSettingsEnabled ? (
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
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    Email settings disabled - basic generation will be used
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    System Prompt
                  </h2>
                  <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                    Advanced
                  </span>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomSystemPrompt}
                    onChange={(e) => setUseCustomSystemPrompt(e.target.checked)}
                    className="mr-2 rounded text-orange-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Override
                  </span>
                </label>
              </div>

              {useCustomSystemPrompt ? (
                <div>
                  <textarea
                    id="customSystemPrompt"
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm font-mono"
                    placeholder={`You are a professional email writer. Generate an email based on the user's description with these specifications:\n- Tone: professional\n- Length: medium\n- Formality: balanced\n\nCreate a complete, ready-to-send email...`}
                    value={customSystemPrompt}
                    onChange={(e) => setCustomSystemPrompt(e.target.value)}
                  />
                  <p className="mt-2 text-xs text-gray-600">
                    <strong>Warning:</strong> Overriding the system prompt gives
                    you full control but may affect output quality. The default
                    prompt is dynamically generated from your email settings
                    above.
                  </p>
                </div>
              ) : (
                <div className="bg-orange-50 rounded-md p-4">
                  <p className="text-xs text-gray-700 mb-2">
                    <strong>Current behavior:</strong> System prompt is
                    automatically generated from your email settings (tone,
                    length, formality, etc.)
                  </p>
                  <p className="text-xs text-gray-600">
                    Enable override to provide your own custom system prompt and
                    take full control of the AI's behavior.
                  </p>
                </div>
              )}
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
                      <span className="text-xs text-gray-500">
                        Powered by OpenAI
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">
                      Uses OpenAI's moderation API to detect harmful content.
                      Adjust thresholds (0-100%) to control sensitivity.
                    </p>
                    <div className="space-y-4">
                      {Object.keys(guardrailsConfig.enabledCategories).map(
                        (category) => {
                          const desc = MODERATION_DESCRIPTIONS[category];
                          return (
                            <div
                              key={category}
                              className="bg-white rounded-lg p-3 border border-purple-100"
                            >
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
                                <span className="text-xs text-gray-500">
                                  Low
                                </span>
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
                                        [category]:
                                          parseInt(e.target.value) / 100,
                                      },
                                    })
                                  }
                                  className="flex-1 h-2 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-xs text-gray-500">
                                  High
                                </span>
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>

                  <div className="border-t border-purple-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Custom Validators
                      </h3>
                      <span className="text-xs text-gray-500">
                        Business Rules
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">
                      Additional validation rules specific to email quality and
                      compliance.
                    </p>
                    <div className="space-y-3">
                      {Object.keys(guardrailsConfig.validators).map(
                        (validator) => {
                          const desc = VALIDATOR_DESCRIPTIONS[validator];
                          return (
                            <div
                              key={validator}
                              className="bg-white rounded-lg p-3 border border-purple-100"
                            >
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
                                        <li
                                          key={idx}
                                          className="text-xs text-gray-500 flex items-start gap-1"
                                        >
                                          <span className="text-purple-400 mt-0.5">
                                            ▪
                                          </span>
                                          <span>{check}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </label>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>

                  <div className="border-t border-purple-200 pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Custom Guardrails (JSON)
                      </h3>
                      <span className="text-xs text-gray-500">
                        OpenAI Format
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Define your own guardrail policies using JSON. Supports
                      regex patterns, keyword matching, and length validation.
                    </p>
                    <textarea
                      id="customGuardrailsJSON"
                      rows={10}
                      className={`w-full px-3 py-2 border ${customGuardrailsError ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-xs font-mono`}
                      placeholder={DEFAULT_CUSTOM_GUARDRAILS_EXAMPLE}
                      value={customGuardrailsJSON}
                      onChange={(e) => setCustomGuardrailsJSON(e.target.value)}
                      onBlur={() => {
                        if (customGuardrailsJSON.trim()) {
                          try {
                            JSON.parse(customGuardrailsJSON);
                            setCustomGuardrailsError("");
                          } catch (err) {
                            setCustomGuardrailsError("Invalid JSON syntax");
                          }
                        } else {
                          setCustomGuardrailsError("");
                        }
                      }}
                    />
                    {customGuardrailsError && (
                      <p className="mt-1 text-xs text-red-600">
                        {customGuardrailsError}
                      </p>
                    )}
                    <div className="mt-2 bg-white rounded-md p-2 border border-purple-100">
                      <details className="text-xs">
                        <summary className="cursor-pointer text-purple-700 font-medium">
                          View example format
                        </summary>
                        <pre className="mt-2 text-xs text-gray-700 overflow-x-auto">
                          {DEFAULT_CUSTOM_GUARDRAILS_EXAMPLE}
                        </pre>
                      </details>
                    </div>
                  </div>

                  <div className="bg-purple-100 rounded-md p-3 mt-4">
                    <p className="text-xs text-purple-800">
                      <strong>How it works:</strong> All validators check your
                      input description for inappropriate content. Your input can be
                      brief—just a few words is fine!
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
