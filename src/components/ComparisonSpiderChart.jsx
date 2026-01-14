import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';
import PlayerAvatar from './PlayerAvatar';

// A rotating color palette for the chart lines
const COLORS = ['#1976d2', '#82ca9d', '#ffc658', '#FF8042', '#9c27b0'];

const DEPTH_CHART_DIMENSIONS = ['Exp (Yrs)', 'Licenses', 'Win %', 'Trophies', 'Elo Rating'];
const statsCache = new Map();

const buildStatsFromSeed = (seedValue) => {
  const safeSeed = String(seedValue || 'fallback');
  const seed = safeSeed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (offset = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  const winRate = 35 + Math.floor(random(1) * 40);
  const age = 32 + Math.floor(random(3) * 25);
  const maxExp = Math.max(4, age - 21);
  const yearsExp = Math.min(3 + Math.floor(random(4) * 25), maxExp);
  const trophies = Math.floor(random(5) * 8);
  const eloRating = 1200 + Math.floor(random(12) * 600);

  return { winRate, yearsExp, trophies, eloRating };
};

const getCoachStats = (staffMember) => {
  const key = String(staffMember?.id ?? staffMember?.staffId ?? staffMember?.name ?? 'fallback');
  if (!statsCache.has(key)) {
    statsCache.set(key, buildStatsFromSeed(key));
  }
  return statsCache.get(key);
};

const normalizeValue = (value, min, max) => {
  if (value === undefined || value === null || Number.isNaN(value) || min === max) {
    return 0;
  }
  const clamped = Math.min(Math.max(value, min), max);
  return ((clamped - min) / (max - min)) * 100;
};

const getLicenseScore = (licenses = []) => {
  if (!Array.isArray(licenses) || licenses.length === 0) return 20;

  let best = 0;
  licenses.forEach((license) => {
    const normalized = license.toLowerCase();
    if (normalized.includes('pro')) {
      best = Math.max(best, 100);
    } else if (normalized.includes('uefa a') || normalized.includes('ussf a') || normalized.includes('canada soccer a')) {
      best = Math.max(best, 85);
    } else if (normalized.includes('uefa b') || normalized.includes('ussf b') || normalized.includes('canada soccer b')) {
      best = Math.max(best, 70);
    } else if (normalized.includes('uefa c') || normalized.includes('ussf c') || normalized.includes('canada soccer c')) {
      best = Math.max(best, 55);
    } else {
      best = Math.max(best, 45);
    }
  });

  return best || Math.min(100, 40 + licenses.length * 10);
};

// Function to calculate score for a staff member based on the new depth chart dimensions
const calculateStaffScore = (staffMember, dimension) => {
  const stats = getCoachStats(staffMember);

  switch (dimension) {
    case 'Exp (Yrs)':
      return normalizeValue(stats?.yearsExp ?? 0, 0, 30);
    case 'Licenses':
      return getLicenseScore(staffMember?.coachingLicenses);
    case 'Win %':
      return Math.min(100, Math.max(0, stats?.winRate ?? 0));
    case 'Trophies':
      return normalizeValue(stats?.trophies ?? 0, 0, 7);
    case 'Elo Rating': {
      const rating = staffMember?.eloRating ?? stats?.eloRating ?? 0;
      return normalizeValue(rating, 1200, 1800);
    }
    default:
      return 0;
  }
};

export default function ComparisonSpiderChart({ plan, staffData }) {
  if (!plan) {
    return null;
  }

  // Fixed depth chart dimensions across all roles
  const dimensions = DEPTH_CHART_DIMENSIONS;
  
  // Get full staff member data for incumbent and candidates
  const incumbentRecord = staffData.find(s => String(s.id) === String(plan.incumbent.id));
  const incumbentData = incumbentRecord || {
    id: String(plan.incumbent.id ?? plan.incumbent.name ?? 'incumbent'),
    coachingLicenses: [],
    eloRating: 1400,
  };

  const candidates = plan.candidates.map(c => ({
    ...c,
    data: staffData.find(s => String(s.id) === String(c.id)) || {
      id: String(c.id),
      coachingLicenses: [],
      eloRating: 1400,
    }
  }));

  // Generate chart data
  const chartData = dimensions.map(dimension => {
    const dataPoint = { dimension };
    
    // Add incumbent score
    dataPoint[plan.incumbent.name] = calculateStaffScore(incumbentData, dimension);
    
    // Add candidate scores
    candidates.forEach(candidate => {
      if (candidate.data) {
        dataPoint[candidate.name] = calculateStaffScore(candidate.data, dimension);
      }
    });
    
    return dataPoint;
  });

  // People to compare (incumbent + candidates)
  const people = [plan.incumbent.name, ...candidates.map(c => c.name)];

  return (
    <Box sx={{ mt: -1 }}>
      {/* Spider Chart */}
      <Paper elevation={0} sx={{ p: 0, m: 0, bgcolor: 'transparent', borderRadius: 2 }}>
        <ResponsiveContainer width="100%" height={600}>
          <RadarChart data={chartData} margin={{ top: 0, right: 10, bottom: 10, left: 10 }}>
            <PolarGrid stroke="#e0e0e0" />
            <PolarAngleAxis 
              dataKey="dimension" 
              tick={{ fill: '#666', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fill: '#999', fontSize: 10 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #ccc',
                borderRadius: 4 
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '8px' }} />
            {people.map((personName, index) => (
              <Radar
                key={personName}
                name={personName}
                dataKey={personName}
                stroke={COLORS[index % COLORS.length]}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={index === 0 ? 0.35 : 0.15}
                strokeWidth={index === 0 ? 3 : 2}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}