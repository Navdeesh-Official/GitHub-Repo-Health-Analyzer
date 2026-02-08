"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RepoAnalysis } from "@/types";
import { Loader2, Search, Github, Sparkles, Shield, Zap, LucideIcon } from "lucide-react";
import { Dashboard } from "@/components/dashboard/Dashboard";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch(`/api/analyze?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      if (!res.ok) {
          throw new Error(data.error || "Failed to analyze repository");
      }

      setAnalysis(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen selection:bg-indigo-500/30 overflow-hidden">
      <div className="container mx-auto px-4 py-12 md:py-20">

        {/* Hero Section */}
        {!analysis && (
          <div className="animate-fade-in">
            {/* Header Badge */}
            <div className="flex flex-col items-center text-center space-y-6 mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-sm font-medium text-indigo-300 animate-pulse-glow">
                <Sparkles className="w-4 h-4" />
                GitHub Repo Health Analyzer
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
                Is that repo{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 animate-gradient">
                  worth your time?
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
                Instantly analyze any public repository for documentation quality,
                maintenance activity, and beginner friendliness.
              </p>
            </div>

            {/* Search Form */}
            <div className="max-w-2xl mx-auto mb-16">
              <form onSubmit={handleAnalyze} className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 group-focus-within:opacity-60 transition-opacity duration-500"></div>

                {/* Form Container */}
                <div className="relative flex flex-col sm:flex-row items-stretch gap-3 p-3 glass rounded-2xl">
                  <div className="flex items-center gap-3 flex-1 px-2">
                    <Github className="w-6 h-6 text-slate-500 shrink-0" />
                    <Input
                      placeholder="https://github.com/owner/repo"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="border-0 bg-transparent focus:ring-0 text-base md:text-lg h-12 placeholder:text-slate-500"
                      aria-label="GitHub repository URL"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="shrink-0 h-12 px-6 rounded-xl cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5 mr-2" />
                    )}
                    {loading ? "Analyzing..." : "Analyze Repo"}
                  </Button>
                </div>
              </form>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 rounded-xl glass border border-red-500/30 text-red-400 text-center animate-slide-down">
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {/* Example repos */}
              <div className="mt-6 text-center text-sm text-slate-500">
                Try:
                <button
                  type="button"
                  onClick={() => setUrl("https://github.com/facebook/react")}
                  className="ml-2 text-indigo-400 hover:text-indigo-300 underline underline-offset-2 cursor-pointer transition-colors"
                >
                  facebook/react
                </button>
                <span className="mx-2">•</span>
                <button
                  type="button"
                  onClick={() => setUrl("https://github.com/vercel/next.js")}
                  className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 cursor-pointer transition-colors"
                >
                  vercel/next.js
                </button>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <FeatureCard
                icon={Shield}
                title="Health Score"
                description="Get a 0-100 score based on documentation, maintenance, and community standards."
                delay="delay-100"
              />
              <FeatureCard
                icon={Zap}
                title="Instant Analysis"
                description="Real-time analysis using GitHub's public API with no authentication required."
                delay="delay-200"
              />
              <FeatureCard
                icon={Sparkles}
                title="Clear Insights"
                description="Understand exactly why a repo scored the way it did with transparent explanations."
                delay="delay-300"
              />
            </div>
          </div>
        )}

        {/* Dashboard View */}
        {analysis && (
          <div className="animate-slide-up">
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => setAnalysis(null)}
                className="text-slate-400 hover:text-white pl-0 cursor-pointer group"
              >
                <span className="group-hover:-translate-x-1 transition-transform mr-2">←</span>
                Analyze another repository
              </Button>
            </div>

            <Dashboard data={analysis} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-slate-500">
          <p>
            Built with{" "}
            <span className="text-indigo-400">Next.js</span> &{" "}
            <span className="text-cyan-400">TailwindCSS</span>
            {" "}• Open Source on GitHub
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <div className={`glass glass-hover rounded-2xl p-6 animate-slide-up cursor-default ${delay}`}>
      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
        <Icon className="w-6 h-6 text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
