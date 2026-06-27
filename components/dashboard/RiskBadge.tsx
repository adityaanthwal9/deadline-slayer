import type { RiskLevel } from '@/types';

const riskConfig = {
  low: { label: 'Low Risk', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', barColor: '#10B981' },
  medium: { label: 'Medium', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', barColor: '#F59E0B' },
  high: { label: 'High Risk', color: '#F97316', bg: 'rgba(249, 115, 22, 0.15)', barColor: '#F97316' },
  critical: { label: '⚠ CRITICAL', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', barColor: '#EF4444' },
};

export function RiskBadge({ level }: { level: RiskLevel | string }) {
  const config = riskConfig[level as RiskLevel] ?? riskConfig.low;
  return (
    <span
      className="text-xs font-semibold px-2 py-1 rounded-md"
      style={{ color: config.color, background: config.bg }}
    >
      {config.label}
    </span>
  );
}

export function RiskBar({ score }: { score: number }) {
  const level: RiskLevel =
    score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';
  const config = riskConfig[level];

  return (
    <div className="risk-bar">
      <div
        className="risk-bar-fill"
        style={{ width: `${Math.min(score, 100)}%`, background: config.barColor }}
      />
    </div>
  );
}

export function RiskScoreCircle({ score }: { score: number }) {
  const level: RiskLevel =
    score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';
  const config = riskConfig[level];

  return (
    <div className="flex flex-col items-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center font-display font-bold text-xl border-2"
        style={{
          color: config.color,
          borderColor: config.color,
          background: config.bg,
        }}
      >
        {score}
      </div>
      <div className="text-xs mt-1" style={{ color: config.color }}>
        {config.label}
      </div>
    </div>
  );
}
