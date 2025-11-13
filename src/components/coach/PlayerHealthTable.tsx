import { useState } from 'react';
import { Profile, PlayerLog } from '@/types';
import HealthIndicatorBadge from './HealthIndicatorBadge';
import { formatDateTime } from '@/lib/utils';
import { ChevronDown, ChevronUp, Activity, AlertCircle } from 'lucide-react';

interface PlayerWithLatestLog extends Profile {
  user_id: string;
  email?: string;
  latestLog?: PlayerLog;
}

interface PlayerHealthTableProps {
  players: PlayerWithLatestLog[];
}

export default function PlayerHealthTable({ players }: PlayerHealthTableProps) {
  const [sortBy, setSortBy] = useState<'name' | 'health' | 'date'>('health');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);

  const handleSort = (column: 'name' | 'health' | 'date') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const sortedPlayers = [...players].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.full_name.localeCompare(b.full_name);
        break;
      case 'health':
        comparison = (a.latestLog?.health_score || 0) - (b.latestLog?.health_score || 0);
        break;
      case 'date':
        const dateA = a.latestLog?.submitted_at || '1970-01-01';
        const dateB = b.latestLog?.submitted_at || '1970-01-01';
        comparison = new Date(dateA).getTime() - new Date(dateB).getTime();
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleExpand = (playerId: string) => {
    setExpandedPlayerId(expandedPlayerId === playerId ? null : playerId);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b">
          <tr className="text-left">
            <th className="pb-3 pr-4">
              <button
                onClick={() => handleSort('name')}
                className="flex items-center gap-1 font-semibold text-text-primary hover:text-primary"
              >
                Player Name
                {sortBy === 'name' && (
                  sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </th>
            <th className="pb-3 pr-4">
              <button
                onClick={() => handleSort('health')}
                className="flex items-center gap-1 font-semibold text-text-primary hover:text-primary"
              >
                Health Status
                {sortBy === 'health' && (
                  sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </th>
            <th className="pb-3 pr-4">
              <button
                onClick={() => handleSort('date')}
                className="flex items-center gap-1 font-semibold text-text-primary hover:text-primary"
              >
                Last Check-In
                {sortBy === 'date' && (
                  sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </th>
            <th className="pb-3">Quick Summary</th>
            <th className="pb-3 text-center">Details</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player) => {
            const isExpanded = expandedPlayerId === player.user_id;
            const hasLog = !!player.latestLog;

            return (
              <>
                <tr key={player.user_id} className="border-b hover:bg-gray-50">
                  <td className="py-4 pr-4">
                    <div>
                      <p className="font-medium text-text-primary">{player.full_name}</p>
                      <p className="text-sm text-text-secondary">Age {player.age}</p>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    {hasLog ? (
                      <HealthIndicatorBadge healthScore={player.latestLog!.health_score} />
                    ) : (
                      <div className="flex items-center gap-2 text-text-secondary">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">No data</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 pr-4">
                    {hasLog ? (
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-text-secondary" />
                        <span className="text-sm text-text-primary">
                          {formatDateTime(player.latestLog!.submitted_at)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-text-secondary">Never</span>
                    )}
                  </td>
                  <td className="py-4 pr-4">
                    {hasLog ? (
                      <div className="text-sm text-text-primary">
                        {player.latestLog!.pain_location_tags.length > 0 
                          ? `Pain in ${player.latestLog!.pain_location_tags.join(', ')}`
                          : player.latestLog!.soreness_level > 6
                          ? `High soreness (${player.latestLog!.soreness_level}/10)`
                          : player.latestLog!.energy_level < 5
                          ? `Low energy (${player.latestLog!.energy_level}/10)`
                          : 'Feeling good'
                        }
                      </div>
                    ) : (
                      <span className="text-sm text-text-secondary">-</span>
                    )}
                  </td>
                  <td className="py-4 text-center">
                    {hasLog && (
                      <button
                        onClick={() => toggleExpand(player.user_id)}
                        className="text-primary hover:text-primary/80"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    )}
                  </td>
                </tr>
                
                {/* Expanded Row */}
                {isExpanded && hasLog && (
                  <tr key={`${player.user_id}-expanded`} className="bg-gray-50">
                    <td colSpan={5} className="px-4 py-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-text-primary mb-2">Latest Reflection</p>
                          <p className="text-sm text-text-secondary">{player.latestLog!.reflection_text}</p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-semibold text-text-primary">Energy Level</p>
                            <p className="text-lg font-bold text-text-primary">
                              {player.latestLog!.energy_level}/10
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-text-primary">Soreness Level</p>
                            <p className="text-lg font-bold text-text-primary">
                              {player.latestLog!.soreness_level}/10
                            </p>
                          </div>
                          {player.latestLog!.pain_severity_level && (
                            <div>
                              <p className="text-sm font-semibold text-text-primary">Pain Severity</p>
                              <p className="text-lg font-bold text-text-primary">
                                {player.latestLog!.pain_severity_level}/10
                              </p>
                            </div>
                          )}
                        </div>

                        {player.latestLog!.pain_location_tags.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-text-primary mb-2">Pain Locations</p>
                            <div className="flex flex-wrap gap-2">
                              {player.latestLog!.pain_location_tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
