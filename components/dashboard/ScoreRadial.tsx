import { cn } from "@/lib/utils";

interface ScoreRadialProps {
    score: number;
    size?: number;
    label?: string;
    verdict?: string;
}

export function ScoreRadial({ score, size = 200, label = "Health Score", verdict }: ScoreRadialProps) {
    const radius = size / 2 - 10;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    // Color based on score
    let colorClass = "text-red-500";
    if (score > 40) colorClass = "text-yellow-500";
    if (score > 70) colorClass = "text-green-500";
    if (score > 90) colorClass = "text-indigo-500";

    return (
        <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full">
                {/* Track */}
                <circle
                    className="text-slate-800"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress */}
                <circle
                    className={cn("transition-all duration-1000 ease-out", colorClass)}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold">{label}</span>
                <span className={cn("text-6xl font-bold tracking-tighter", colorClass)}>{score}</span>
                {verdict && (
                    <span className="mt-2 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {verdict}
                    </span>
                )}
            </div>
        </div>
    );
}
