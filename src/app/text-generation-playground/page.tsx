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
        return;
      }

      setGeneratedEmail(data.generatedEmail);
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
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      OpenAI Moderation
                    </h3>
                    <div className="space-y-3">
                      {Object.keys(guardrailsConfig.enabledCategories).map(
                        (category) => (
                          <div key={category}>
                            <div className="flex items-center justify-between mb-1">
                              <label className="flex items-center">
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
                                  className="mr-2 rounded text-purple-600"
                                />
                                <span className="text-sm text-gray-700 capitalize">
                                  {category.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                              </label>
                              <span className="text-xs text-gray-500">
                                {(
                                  guardrailsConfig.thresholds[
                                    category as keyof typeof guardrailsConfig.thresholds
                                  ] * 100
                                ).toFixed(0)}
                                %
                              </span>
                            </div>
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
                              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="border-t border-purple-200 pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Custom Validators
                    </h3>
                    <div className="space-y-2">
                      {Object.keys(guardrailsConfig.validators).map(
                        (validator) => (
                          <label key={validator} className="flex items-center">
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
                              className="mr-2 rounded text-purple-600"
                            />
                            <span className="text-sm text-gray-700">
                              {validator
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^check/, "")
                                .trim()}
                            </span>
                          </label>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="bg-purple-100 rounded-md p-3 mt-4">
                    <p className="text-xs text-purple-800">
                      <strong>Note:</strong> Guardrails filter both input
                      descriptions and generated outputs. Content will be
                      blocked if it violates any enabled rules.
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
