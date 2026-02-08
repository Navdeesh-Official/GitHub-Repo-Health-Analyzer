import { type LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  delay
}: FeatureCardProps) {
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
