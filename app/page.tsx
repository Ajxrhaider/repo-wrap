"use client";

import { FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type GenerationResponse = {
  readme?: string;
  error?: string;
};

const PACKAGE_JSON_MAX_LENGTH = 60_000;
const CODE_SNIPPETS_MAX_LENGTH = 120_000;

function SparkleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m12 3-1.8 5.2L5 10l5.2 1.8L12 17l1.8-5.2L19 10l-5.2-1.8L12 3Z" />
      <path d="m19 15-.8 2.2L16 18l2.2.8L19 21l.8-2.2L22 18l-2.2-.8L19 15Z" />
      <path d="m5 2-.7 2.3L2 5l2.3.7L5 8l.7-2.3L8 5l-2.3-.7L5 2Z" />
    </svg>
  );
}

function DocumentIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M14 2.5H6.5A2.5 2.5 0 0 0 4 5v14a2.5 2.5 0 0 0 2.5 2.5h11A2.5 2.5 0 0 0 20 19V8.5L14 2.5Z" />
      <path d="M14 2.5V9h6" />
      <path d="M8 13h8" />
      <path d="M8 17h6" />
    </svg>
  );
}

function ClipboardIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m5 12 4.2 4.2L19 6.5" />
    </svg>
  );
}

function AlertIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10.3 3.9 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4.5" />
      <path d="M12 17.3h.01" />
    </svg>
  );
}

export default function HomePage() {
  const [packageJson, setPackageJson] = useState("");
  const [codeSnippets, setCodeSnippets] = useState("");
  const [generatedReadme, setGeneratedReadme] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setCopyStatus("idle");

    const trimmedPackageJson = packageJson.trim();

    if (!trimmedPackageJson) {
      setErrorMessage("Please paste your package.json contents before generating a README.");
      return;
    }

    try {
      const parsedPackageJson: unknown = JSON.parse(trimmedPackageJson);

      if (
        typeof parsedPackageJson !== "object" ||
        parsedPackageJson === null ||
        Array.isArray(parsedPackageJson)
      ) {
        setErrorMessage(
          "Your package.json must contain a valid JSON object, not an array or primitive value.",
        );
        return;
      }
    } catch {
      setErrorMessage(
        "Your package.json is not valid JSON. Check for missing commas, unmatched quotes, or trailing characters.",
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageJson: trimmedPackageJson,
          codeSnippets: codeSnippets.trim(),
        }),
      });

      let result: GenerationResponse;

      try {
        result = (await response.json()) as GenerationResponse;
      } catch {
        throw new Error(
          "The generation service returned an unexpected response. Please try again.",
        );
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
            "README generation failed. Please review your input and try again.",
        );
      }

      if (!result.readme) {
        throw new Error(
          "No README content was returned. Please try generating again.",
        );
      }

      setGeneratedReadme(result.readme);
    } catch (error) {
      setGeneratedReadme("");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while generating your README. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopyReadme() {
    if (!generatedReadme) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedReadme);
      setCopyStatus("copied");

      window.setTimeout(() => {
        setCopyStatus("idle");
      }, 2_500);
    } catch {
      setErrorMessage(
        "Your browser could not copy the README automatically. Please select and copy the text manually.",
      );
    }
  }

  function handleClear() {
    setPackageJson("");
    setCodeSnippets("");
    setGeneratedReadme("");
    setErrorMessage("");
    setCopyStatus("idle");
  }

  return (
    <main>
      <section className="overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-700">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-indigo-50 backdrop-blur-sm">
              <SparkleIcon className="h-4 w-4 text-emerald-300" />
              AI-powered project documentation
            </div>

            <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Turn project context into a README worth shipping.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-indigo-100 sm:text-xl">
              Paste your <code className="rounded bg-white/10 px-1.5 py-0.5 text-white">package.json</code>{" "}
              and key code snippets. repo-wrap analyzes your stack and creates
              a clear, professional README in seconds.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-indigo-100">
              <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2">
                Server-side Gemini API
              </span>
              <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2">
                GitHub-flavored Markdown
              </span>
              <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2">
                No database required
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="generator" className="scroll-mt-20 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="font-heading text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">
              README generator
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900">
              Give repo-wrap your project context
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              A valid <code className="rounded bg-slate-200 px-1.5 py-0.5 text-sm text-slate-800">package.json</code>{" "}
              is required. Code context is optional but helps produce more
              accurate features, usage instructions, and architecture details.
            </p>
          </div>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-7"
            >
              <div className="space-y-6">
                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <label
                      htmlFor="package-json"
                      className="flex items-center gap-2 font-heading text-base font-bold text-slate-900"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100 text-indigo-700">
                        <DocumentIcon className="h-4 w-4" />
                      </span>
                      package.json
                      <span className="text-[#ef4444]">*</span>
                    </label>
                    <span className="text-xs font-medium text-slate-500">
                      {packageJson.length.toLocaleString()} /{" "}
                      {PACKAGE_JSON_MAX_LENGTH.toLocaleString()} characters
                    </span>
                  </div>

                  <textarea
                    id="package-json"
                    value={packageJson}
                    onChange={(event) => {
                      setPackageJson(event.target.value);
                      if (errorMessage) {
                        setErrorMessage("");
                      }
                    }}
                    maxLength={PACKAGE_JSON_MAX_LENGTH}
                    required
                    spellCheck={false}
                    autoCapitalize="none"
                    placeholder={`{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev"
  },
  "dependencies": {}
}`}
                    className="min-h-72 w-full resize-y rounded-xl border border-slate-300 bg-slate-950 px-4 py-3 font-mono text-sm leading-6 text-emerald-300 shadow-inner outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    aria-describedby="package-json-help"
                  />

                  <p id="package-json-help" className="mt-2 text-sm text-slate-500">
                    Include scripts, dependencies, devDependencies, and package
                    metadata for the best result.
                  </p>
                </div>

                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <label
                      htmlFor="code-snippets"
                      className="flex items-center gap-2 font-heading text-base font-bold text-slate-900"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path d="m8 9-3 3 3 3" />
                          <path d="m16 9 3 3-3 3" />
                          <path d="m14 5-4 14" />
                        </svg>
                      </span>
                      Key code snippets
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                        Recommended
                      </span>
                    </label>
                    <span className="text-xs font-medium text-slate-500">
                      {codeSnippets.length.toLocaleString()} /{" "}
                      {CODE_SNIPPETS_MAX_LENGTH.toLocaleString()} characters
                    </span>
                  </div>

                  <textarea
                    id="code-snippets"
                    value={codeSnippets}
                    onChange={(event) => {
                      setCodeSnippets(event.target.value);
                      if (errorMessage) {
                        setErrorMessage("");
                      }
                    }}
                    maxLength={CODE_SNIPPETS_MAX_LENGTH}
                    spellCheck={false}
                    autoCapitalize="none"
                    placeholder={`Paste representative files here, for example:

// app/page.tsx
export default function HomePage() {
  return <main>...</main>;
}

// src/server/index.ts
export async function createServer() {
  ...
}`}
                    className="min-h-72 w-full resize-y rounded-xl border border-slate-300 bg-slate-950 px-4 py-3 font-mono text-sm leading-6 text-sky-200 shadow-inner outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    aria-describedby="code-snippets-help"
                  />

                  <p id="code-snippets-help" className="mt-2 text-sm text-slate-500">
                    Include entry points, primary components, API routes, or
                    architecture-defining files. Never paste secrets or private
                    keys.
                  </p>
                </div>

                {errorMessage ? (
                  <div
                    className="flex gap-3 rounded-xl border border-[#ef4444]/40 bg-red-50 px-4 py-3 text-sm leading-6 text-[#b91c1c]"
                    role="alert"
                    aria-live="assertive"
                  >
                    <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#ef4444]" />
                    <p>{errorMessage}</p>
                  </div>
                ) : null}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={isLoading}
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Clear all
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-400 disabled:shadow-none"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="h-5 w-5 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            className="opacity-90"
                            fill="currentColor"
                            d="M12 3a9 9 0 0 0-9 9h3a6 6 0 0 1 6-6V3Z"
                          />
                        </svg>
                        Analyzing project…
                      </>
                    ) : (
                      <>
                        <SparkleIcon className="h-5 w-5" />
                        Generate README
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            <section
              className="flex min-h-156 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)]"
              aria-label="Generated README preview"
              aria-live="polite"
            >
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                    <DocumentIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-heading font-bold text-slate-900">
                      Generated README
                    </h2>
                    <p className="text-xs text-slate-500">
                      Markdown preview
                    </p>
                  </div>
                </div>

                {generatedReadme ? (
                  <button
                    type="button"
                    onClick={handleCopyReadme}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    {copyStatus === "copied" ? (
                      <>
                        <CheckIcon className="h-4 w-4 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <ClipboardIcon className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </button>
                ) : null}
              </div>

              <div className="min-h-0 flex-1 overflow-auto p-5 sm:p-7">
                {isLoading ? (
                  <div className="flex h-full min-h-100 flex-col items-center justify-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                      <svg
                        className="h-7 w-7 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="opacity-90"
                          fill="currentColor"
                          d="M12 3a9 9 0 0 0-9 9h3a6 6 0 0 1 6-6V3Z"
                        />
                      </svg>
                    </div>
                    <h3 className="mt-5 font-heading text-lg font-bold text-slate-900">
                      Building your documentation
                    </h3>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                      Gemini is reviewing your dependencies, scripts, and code
                      context.
                    </p>
                  </div>
                ) : generatedReadme ? (
                  <article className="markdown-content text-[15px] leading-7 text-slate-700">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="mb-5 font-heading text-3xl font-bold tracking-tight text-slate-950">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mb-3 mt-8 border-b border-slate-200 pb-2 font-heading text-xl font-bold tracking-tight text-slate-900 first:mt-0">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mb-2 mt-6 font-heading text-lg font-bold text-slate-900">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="mb-4 last:mb-0">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="mb-4 list-disc space-y-1 pl-6 marker:text-indigo-500">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="mb-4 list-decimal space-y-1 pl-6 marker:font-semibold marker:text-indigo-600">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => <li>{children}</li>,
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-indigo-600 underline decoration-indigo-300 underline-offset-2 transition hover:text-indigo-800"
                          >
                            {children}
                          </a>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="my-5 border-l-4 border-emerald-400 bg-emerald-50 px-4 py-3 text-slate-700">
                            {children}
                          </blockquote>
                        ),
                        pre: ({ children }) => (
                          <pre className="my-5 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-100 shadow-inner">
                            {children}
                          </pre>
                        ),
                        code: ({ className, children, ...props }) => (
                          <code
                            className={
                              className
                                ? `font-mono text-sm ${className}`
                                : "rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-pink-700"
                            }
                            {...props}
                          >
                            {children}
                          </code>
                        ),
                        table: ({ children }) => (
                          <table className="my-5 min-w-full border-collapse overflow-hidden rounded-lg border border-slate-200 text-left text-sm">
                            {children}
                          </table>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-slate-100 text-slate-800">
                            {children}
                          </thead>
                        ),
                        th: ({ children }) => (
                          <th className="border border-slate-200 px-3 py-2 font-semibold">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-slate-200 px-3 py-2 align-top">
                            {children}
                          </td>
                        ),
                        hr: () => <hr className="my-7 border-slate-200" />,
                      }}
                    >
                      {generatedReadme}
                    </ReactMarkdown>
                  </article>
                ) : (
                  <div className="flex h-full min-h-100 flex-col items-center justify-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <DocumentIcon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 font-heading text-lg font-bold text-slate-800">
                      Your README will appear here
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      Add your project context on the left, then generate a
                      polished Markdown README ready for review and copy.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 border-y border-slate-200 bg-white py-14 sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-heading text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">
              Simple by design
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900">
              From repository context to clear documentation
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Paste project context",
                description:
                  "Provide your package metadata and the source files that best explain your product.",
              },
              {
                number: "02",
                title: "Let Gemini analyze",
                description:
                  "The server securely analyzes dependencies, scripts, and implementation details.",
              },
              {
                number: "03",
                title: "Review and ship",
                description:
                  "Copy the structured Markdown, validate it, and commit it to your repository.",
              },
            ].map((step) => (
              <article
                key={step.number}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <span className="font-heading text-sm font-bold text-indigo-600">
                  {step.number}
                </span>
                <h3 className="mt-4 font-heading text-xl font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}