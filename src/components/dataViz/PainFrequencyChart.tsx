'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PlayerLog } from '@/types';

interface PainFrequencyChartProps {
  logs: PlayerLog[];
}

export default function PainFrequencyChart({ logs }: PainFrequencyChartProps) {
  const painData = useMemo(() => {
    const painCounts: Record<string, number> = {};
    
    // Count pain location occurrences
    logs.forEach(log => {
      if (log.pain_location_tags && log.pain_location_tags.length > 0) {
        log.pain_location_tags.forEach(location => {
          painCounts[location] = (painCounts[location] || 0) + 1;
        });
      }
    });
    
    // Convert to array and sort by frequency
    return Object.entries(painCounts)
      .map(([location, count]) => ({
        location,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 most frequent
  }, [logs]);

  if (painData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-text-secondary">No pain data recorded yet</p>
      </div>
    );
  }

  // Color based on frequency
  const getColor = (count: number, maxCount: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return '#DC143C'; // Red - high frequency
    if (ratio > 0.4) return '#FFA500'; // Orange - moderate frequency
    return '#FFD700'; // Yellow - low frequency
  };

  const maxCount = Math.max(...painData.map(d => d.count));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={painData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="location" 
          angle={-45}
          textAnchor="end"
          height={80}
          tick={{ fill: '#6C757D', fontSize: 12 }}
        />
        <YAxis tick={{ fill: '#6C757D' }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#212529', fontWeight: 600 }}
        />
        <Bar dataKey="count" name="Occurrences" radius={[8, 8, 0, 0]}>
          {painData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.count, maxCount)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}