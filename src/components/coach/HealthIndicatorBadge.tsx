import { getHealthColor, getHealthColorHex } from '@/lib/utils';

interface HealthIndicatorBadgeProps {
  healthScore: number;
}

export default function HealthIndicatorBadge({ healthScore }: HealthIndicatorBadgeProps) {
  const color = getHealthColor(healthScore);
  const colorHex = getHealthColorHex(color);

  const getStatusText = (color: 'green' | 'yellow' | 'orange' | 'red'): string => {
    switch (color) {
      case 'green':
        return 'Ready';
      case 'yellow':
        return 'Monitor';
      case 'orange':
        return 'Caution';
      case 'red':
        return 'At Risk';
      default:
        return 'Unknown';
    }
  };

  const statusText = getStatusText(color);

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-6 w-6 rounded-full border-2 border-white shadow-md"
        style={{ backgroundColor: colorHex }}
        title={`Health Score: ${healthScore}`}
      />
      <div>
        <p className="text-sm font-semibold" style={{ color: colorHex }}>
          {statusText}
        </p>
        <p className="text-xs text-text-secondary">Score: {healthScore}</p>
      </div>
    </div>
  );
}
