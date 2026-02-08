import { type ElementType } from "react";
import { RepoAnalysis } from "@/types";
import { Card, CardTitle } from "@/components/ui/card";
import { ScoreRadial } from "./ScoreRadial";
import { CheckCircle2, AlertTriangle, XCircle, GitCommit, Users, BookOpen, Scale, Star, GitFork, Bug, UserRound, ExternalLink } from "lucide-react";

interface DashboardProps {
    data: RepoAnalysis;
}

export function Dashboard({ data }: DashboardProps) {
    return (
        <div className="space-y-6">
            {/* Top Row: Score & Meta */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score Card */}
                <Card className="lg:col-span-1 flex flex-col items-center justify-center py-10 bg-gradient-to-b from-slate-900/80 to-slate-950/50">
                    <ScoreRadial score={data.healthScore} verdict={data.verdict} />
                </Card>

                {/* Details Card */}
                <Card className="lg:col-span-2 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3 flex-wrap">
                                <span className="truncate">{data.details.owner}/{data.details.name}</span>
                                <a
                                    href={data.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    GitHub
                                </a>
                            </h2>
                            <p className="text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                                {data.details.description || "No description provided."}
                            </p>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Last commit</div>
                            <div className="text-white font-semibold">
                                {new Date(data.details.lastCommitDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <MetricBox label="Stars" value={formatNumber(data.details.stars)} icon={Star} color="text-yellow-400" />
                        <MetricBox label="Forks" value={formatNumber(data.details.forks)} icon={GitFork} color="text-cyan-400" />
                        <MetricBox label="Issues" value={formatNumber(data.details.openIssues)} icon={Bug} color="text-amber-400" />
                        <MetricBox label="Contributors" value={formatNumber(data.contributorsCount)} icon={UserRound} color="text-indigo-400" />
                    </div>

                    {/* Health Breakdown */}
                    <div className="pt-5 border-t border-slate-800/50">
                        <h4 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Health Breakdown</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ScoreBar label="Documentation" score={data.subScores.documentation} max={30} icon={BookOpen} />
                            <ScoreBar label="Maintenance" score={data.subScores.maintenance} max={30} icon={GitCommit} />
                            <ScoreBar label="Collaboration" score={data.subScores.collaboration} max={20} icon={Users} />
                            <ScoreBar label="Beginner Friendly" score={data.subScores.beginnerFriendly} max={20} icon={CheckCircle2} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Bottom Row: Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Key Checks */}
                <Card>
                    <CardTitle className="mb-5 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <Scale className="w-4 h-4 text-indigo-400" />
                        </div>
                        Key Checks
                    </CardTitle>
                    <div className="space-y-1">
                        <CheckItem label="README.md Present" status={data.fileChecks.hasReadme} />
                        <CheckItem label="Detailed Documentation (>1000 chars)" status={data.fileChecks.readmeSize > 1000} />
                        <CheckItem label="License File" status={data.fileChecks.hasLicense} />
                        <CheckItem label="CONTRIBUTING.md" status={data.fileChecks.hasContributing} />
                        <CheckItem label="Code of Conduct" status={data.fileChecks.hasCodeOfConduct} />
                    </div>
                </Card>

                {/* Analysis Report */}
                <Card>
                    <CardTitle className="mb-5 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                        </div>
                        Analysis Report
                    </CardTitle>
                    {data.breakdown.length === 0 ? (
                        <div className="flex items-center gap-3 text-green-400 glass p-4 rounded-xl border border-green-500/20 bg-green-500/5">
                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                            <span className="text-sm">This repository looks excellent! No major issues found.</span>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {data.breakdown.map((item, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-3 text-slate-300 glass p-3 rounded-xl text-sm border border-amber-500/10 bg-amber-500/5"
                                >
                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
        </div>
    );
}

function formatNumber(num: number): string {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
}

function MetricBox({ label, value, icon: Icon, color }: { label: string; value: string; icon: ElementType; color: string }) {
    return (
        <div className="glass rounded-xl p-4 text-center transition-all duration-200 hover:border-slate-700 cursor-default">
            <div className="flex items-center justify-center gap-1.5 mb-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-2xl font-bold text-white">{value}</span>
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">{label}</div>
        </div>
    );
}

function ScoreBar({ label, score, max, icon: Icon }: { label: string; score: number; max: number; icon: ElementType }) {
    const percent = (score / max) * 100;
    const colorClass = percent >= 70 ? 'bg-green-500' : percent >= 40 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-500" />
                    {label}
                </span>
                <span className="text-white font-semibold tabular-nums">{score}/{max}</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}

function CheckItem({ label, status }: { label: string; status: boolean }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-slate-800/30 last:border-0">
            <span className="text-slate-300 text-sm">{label}</span>
            {status ? (
                <span className="flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Pass
                </span>
            ) : (
                <span className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                    <XCircle className="w-3.5 h-3.5" />
                    Fail
                </span>
            )}
        </div>
    );
}
