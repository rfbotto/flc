"use client";

import { useState } from "react";

interface GuardrailsConfig {
  tone: string;
  length: string;
  includeCallToAction: boolean;
  formalityLevel: string;
  brandVoice: string;
}

export default function PlaygroundPage() {
  const [userInput, setUserInput] = useState("");
  const [guardrails, setGuardrails] = useState<GuardrailsConfig>({
    tone: "professional",
    length: "medium",
    includeCallToAction: false,
    formalityLevel: "balanced",
    brandVoice: "",
  });
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCopyToast, setShowCopyToast] = useState(false);

  const handleGenerate = async () => {
    if (!userInput.trim()) {
      setError("Please enter an email description");
      return;
    }

    setIsLoading(true);
    setError("");
    setGeneratedEmail("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput,
          guardrails,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate email");
      }

      setGeneratedEmail(data.generatedEmail);
    } catch (err: any) {
      setError(err.message || "An error occurred while generating the email");
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
      setError("Failed to copy to clipboard");
    }
  };

  const handleClear = () => {
    setGeneratedEmail("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            AI Email Generation Playground
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Experimental tool for exploring AI-powered email generation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
                      Copy to Clipboard
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
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-800">{error}</p>
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

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Experimental Guardrails
                </h2>
                <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                  Temporary
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-6">
                These controls are for team experimentation only
              </p>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="tone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tone
                  </label>
                  <select
                    id="tone"
                    value={guardrails.tone}
                    onChange={(e) =>
                      setGuardrails({ ...guardrails, tone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                    <option value="casual">Casual</option>
                    <option value="enthusiastic">Enthusiastic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Length
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="length"
                        value="short"
                        checked={guardrails.length === "short"}
                        onChange={(e) =>
                          setGuardrails({
                            ...guardrails,
                            length: e.target.value,
                          })
                        }
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Short (~100 words)
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="length"
                        value="medium"
                        checked={guardrails.length === "medium"}
                        onChange={(e) =>
                          setGuardrails({
                            ...guardrails,
                            length: e.target.value,
                          })
                        }
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Medium (~200 words)
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="length"
                        value="long"
                        checked={guardrails.length === "long"}
                        onChange={(e) =>
                          setGuardrails({
                            ...guardrails,
                            length: e.target.value,
                          })
                        }
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Long (~300 words)
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={guardrails.includeCallToAction}
                      onChange={(e) =>
                        setGuardrails({
                          ...guardrails,
                          includeCallToAction: e.target.checked,
                        })
                      }
                      className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Include Call-to-Action
                    </span>
                  </label>
                </div>

                <div>
                  <label
                    htmlFor="formality"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Formality Level
                  </label>
                  <select
                    id="formality"
                    value={guardrails.formalityLevel}
                    onChange={(e) =>
                      setGuardrails({
                        ...guardrails,
                        formalityLevel: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="casual">Casual</option>
                    <option value="balanced">Balanced</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="brandVoice"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Brand Voice (Optional)
                  </label>
                  <input
                    type="text"
                    id="brandVoice"
                    value={guardrails.brandVoice}
                    onChange={(e) =>
                      setGuardrails({
                        ...guardrails,
                        brandVoice: e.target.value,
                      })
                    }
                    placeholder="e.g., innovative, customer-focused"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCopyToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-md shadow-lg">
          Copied to clipboard!
        </div>
      )}
    </div>
  );
}
