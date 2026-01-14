import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Tooltip,
} from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import ComparisonSpiderChart from './ComparisonSpiderChart';
import { createWatchlistColumns, generateStats } from './WatchlistGrid';
import successionPlans from '../data/successionPlans.json';
import staffTalent from '../data/staff_talent.json';
import '../styles/design-tokens.css';

const DEFAULT_KPIS = ['readiness', 'eloRating', 'licenseDepth', 'mlsExperience'];

const computeReadinessScore = (record) => {
  if (!record) return 0;
  const licenseScore = Math.min(100, (record.coachingLicenses?.length ?? 0) * 12.5);
  const elo = record.eloRating ?? 1300;
  const eloScore = Math.min(100, Math.max(0, ((elo - 1200) / 600) * 100));
  let expScore = record.currentlyEmployed ? 45 : 35;
  if (record.proCoachExp || record.sportingExp) expScore += 20;
  if (record.mlsCoachExp) expScore += 15;
  if (record.mlsSportingExp) expScore += 10;
  if (record.prevMlsCoachExp || record.prevMlsSportingExp) expScore += 5;
  expScore = Math.min(100, expScore);
  const tagsScore = Math.min(100, (record.tags?.length ?? 0) * 12.5);
  return Math.round((licenseScore + eloScore + expScore + tagsScore) / 4);
};

const TIMELINE_COLORS = ['#1976d2', '#82ca9d', '#ffc658', '#FF8042', '#9c27b0'];

const TIMELINE_METRICS = [
  {
    id: 'readiness',
    label: 'Readiness Score',
    accessor: (profile) => computeReadinessScore(profile),
    min: 0,
    max: 100,
    volatility: 6,
    precision: 0,
  },
  {
    id: 'eloRating',
    label: 'Elo Rating',
    accessor: (profile) => profile?.eloRating ?? 1300,
    min: 1100,
    max: 1900,
    volatility: 35,
    precision: 0,
  },
  {
    id: 'winRate',
    label: 'Win %',
    accessor: (profile, stats) => stats?.winRate ?? 0,
    min: 20,
    max: 80,
    volatility: 5,
    precision: 0,
  },
  {
    id: 'ppm',
    label: 'Points per Match',
    accessor: (profile, stats) => Number(stats?.ppm ?? 1.4),
    min: 0.8,
    max: 2.6,
    volatility: 0.15,
    precision: 2,
  },
];

const COMPARISON_COLUMN_VISIBILITY = {
  watchlistActions: false,
  notes: false,
  picUrl: true,
  priority: true,
  targetRole: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: false,
  tags: true,
  roles: true,
  location: true,
  currentEmployer: true,
  interestArea: true,
  coachingLicenses: true,
  license: true,
  winRate: true,
  ppm: true,
  trophies: true,
  xgDiff: false,
  squadValuePerf: false,
  possession: false,
  u23Minutes: false,
  academyDebuts: false,
  eloRating: true,
  languages: false,
};

const ensureCoachingStats = (staff) => {
  if (!staff) return null;
  if (staff.coachingStats) return staff;
  return {
    ...staff,
    coachingStats: generateStats(String(staff.id ?? staff.name ?? 'succession')),
  };
};

const buildSeedFromValue = (value) => {
  const source = String(value ?? 'succession');
  return source.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
};

const seededNoise = (seed, offset = 0) => {
  const x = Math.sin(seed * 31 + offset * 17) * 10000;
  return x - Math.floor(x);
};

const clamp = (value, min, max) => {
  if (min === undefined || max === undefined) return value;
  return Math.max(min, Math.min(max, value));
};

const KPI_OPTIONS = [
  {
    id: 'readiness',
    label: 'Readiness Score',
    formatter: (value) => (value || value === 0 ? `${Math.round(value)}` : '—'),
    description: 'Composite score across Elo, licensing, and MLS exposure',
    getValue: (record) => computeReadinessScore(record),
    unit: '',
  },
  {
    id: 'eloRating',
    label: 'Elo Rating',
    formatter: (value) => (value || value === 0 ? value.toLocaleString() : '—'),
    description: 'Relative performance signal vs. coaching cohort',
    getValue: (record) => record?.eloRating ?? null,
    unit: '',
  },
  {
    id: 'licenseDepth',
    label: 'Licenses Held',
    formatter: (value) => (value || value === 0 ? value : '—'),
    description: 'Count of active coaching licenses on file',
    getValue: (record) => record?.coachingLicenses?.length ?? 0,
    unit: '',
  },
  {
    id: 'languageRange',
    label: 'Languages',
    formatter: (value) => (value || value === 0 ? value : '—'),
    description: 'Language coverage for the role',
    getValue: (record) => record?.languages?.length ?? 0,
    unit: '',
  },
  {
    id: 'mlsExperience',
    label: 'MLS Experience',
    formatter: (value) => `${value}%`,
    description: 'Share of MLS-specific exposure across coaching/sporting roles',
    getValue: (record) => {
      if (!record) return 0;
      const flags = [
        record.mlsCoachExp,
        record.prevMlsCoachExp,
        record.mlsSportingExp,
        record.prevMlsSportingExp,
      ].filter(Boolean).length;
      const baseline = record.proCoachExp || record.sportingExp ? 40 : 20;
      return Math.min(100, baseline + flags * 15);
    },
    unit: '%',
  },
  {
    id: 'talentTags',
    label: 'Signal Tags',
    formatter: (value) => (value || value === 0 ? value : '—'),
    description: 'Volume of curated talent tags',
    getValue: (record) => record?.tags?.length ?? 0,
    unit: '',
  },
];

const getFullName = (record) => {
  if (!record) return 'Unknown';
  return `${record.firstName ?? ''} ${record.lastName ?? ''}`.trim() || record.name || 'Unknown';
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

function SuccessionPlanningAnalysis({ filteredStaff = [], successionContext }) {
  const staffIndex = useMemo(() => {
    const map = new Map();
    staffTalent.forEach((staff) => {
      map.set(String(staff.id), staff);
    });
    return map;
  }, []);

  const contextPlan = useMemo(() => {
    if (!successionContext || (!successionContext.plan && !successionContext.planId && !successionContext.role)) {
      return null;
    }
    const draft = successionContext.plan
      ? successionContext.plan
      : successionPlans.find((plan) => plan.id === successionContext.planId) || null;
    if (draft) {
      return draft;
    }
    if (successionContext.role) {
      const predefined = successionPlans.find((plan) => plan.role === successionContext.role);
      if (predefined) return predefined;
      if (successionContext.incumbent) {
        return {
          id: successionContext.planId || `context-${successionContext.role}`,
          role: successionContext.role,
          incumbent: successionContext.incumbent,
          candidates: successionContext.candidates || [],
          lastUpdated: successionContext.lastUpdated || new Date().toISOString(),
        };
      }
    }
    return null;
  }, [successionContext]);

  const planOptions = useMemo(() => {
    const plans = [...successionPlans];
    if (contextPlan && !plans.find((plan) => plan.id === contextPlan.id)) {
      plans.unshift(contextPlan);
    }
    return plans;
  }, [contextPlan]);

  const [selectedPlanId, setSelectedPlanId] = useState(() => {
    if (contextPlan?.id) return contextPlan.id;
    if (successionContext?.planId) return successionContext.planId;
    if (successionContext?.role) {
      const roleMatch = successionPlans.find((plan) => plan.role === successionContext.role);
      if (roleMatch) return roleMatch.id;
    }
    return planOptions[0]?.id ?? null;
  });

  useEffect(() => {
    if (!contextPlan) return;
    if (contextPlan.id !== selectedPlanId) {
      setSelectedPlanId(contextPlan.id);
    }
  }, [contextPlan, selectedPlanId]);

  const activePlan = planOptions.find((plan) => plan.id === selectedPlanId) || planOptions[0] || null;

  const staffPool = filteredStaff.length ? filteredStaff : staffTalent;
  const filteredStaffIds = useMemo(() => new Set(staffPool.map((staff) => String(staff.id))), [staffPool]);

  const incumbentProfile = useMemo(() => {
    if (!activePlan?.incumbent) return null;
    const record = staffIndex.get(String(activePlan.incumbent.id)) || null;
    return ensureCoachingStats(record);
  }, [activePlan, staffIndex]);

  const candidateProfiles = useMemo(() => {
    if (!activePlan) return [];
    return (activePlan.candidates ?? []).map((candidate) => {
      const profile = staffIndex.get(String(candidate.id)) || null;
      return {
        ...candidate,
        profile: ensureCoachingStats(profile),
        matchesFilters: filteredStaffIds.has(String(candidate.id)),
      };
    });
  }, [activePlan, staffIndex, filteredStaffIds]);

  const [selectedKpis, setSelectedKpis] = useState(DEFAULT_KPIS);
  const [timelineMetric, setTimelineMetric] = useState('readiness');
  const selectedTimelineMetric = useMemo(
    () => TIMELINE_METRICS.find((metric) => metric.id === timelineMetric) || TIMELINE_METRICS[0],
    [timelineMetric],
  );

  const readinessBuckets = useMemo(() => {
    return candidateProfiles.reduce(
      (acc, candidate) => {
        const readiness = computeReadinessScore(candidate.profile);
        if (readiness >= 70) acc.readyNow += 1;
        else if (readiness >= 50) acc.readySoon += 1;
        else acc.emerging += 1;
        return acc;
      },
      { readyNow: 0, readySoon: 0, emerging: 0 },
    );
  }, [candidateProfiles]);

  const coverageScore = useMemo(() => {
    const total = candidateProfiles.length || 1;
    const weighted = readinessBuckets.readyNow * 1 + readinessBuckets.readySoon * 0.6 + readinessBuckets.emerging * 0.3;
    return Math.round((weighted / total) * 100);
  }, [candidateProfiles, readinessBuckets]);

  const timelinePeople = useMemo(() => {
    const list = [];
    if (incumbentProfile) {
      const currentName = activePlan?.incumbent?.name || getFullName(incumbentProfile) || 'Current';
      list.push({
        key: `incumbent-${incumbentProfile.id}`,
        profile: incumbentProfile,
        displayName: `${currentName} (Current)`,
        seed: buildSeedFromValue(incumbentProfile.id || currentName),
      });
    }
    candidateProfiles.slice(0, 3).forEach((candidate) => {
      if (!candidate.profile) return;
      list.push({
        key: `candidate-${candidate.id}`,
        profile: candidate.profile,
        displayName: candidate.name || getFullName(candidate.profile),
        seed: buildSeedFromValue(candidate.profile.id || candidate.name),
      });
    });
    return list;
  }, [incumbentProfile, candidateProfiles, activePlan]);

  const timelineData = useMemo(() => {
    if (!timelinePeople.length) return [];
    const metricDef = selectedTimelineMetric;
    const periods = Array.from({ length: 6 }, (_, idx) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - idx));
      return date.toLocaleString(undefined, { month: 'short', year: '2-digit' });
    });

    return periods.map((label, idx) => {
      const point = { period: label };
      timelinePeople.forEach((person) => {
        const stats = person.profile?.coachingStats || generateStats(String(person.profile?.id ?? person.displayName));
        const baseValue = metricDef.accessor(person.profile, stats) ?? 0;
        const drift = (seededNoise(person.seed, idx) - 0.5) * metricDef.volatility;
        const clamped = clamp(baseValue + drift, metricDef.min, metricDef.max);
        const precision = metricDef.precision ?? 0;
        point[person.displayName] = Number(clamped.toFixed(precision));
      });
      return point;
    });
  }, [timelinePeople, selectedTimelineMetric]);

  const comparisonColumns = useMemo(
    () =>
      createWatchlistColumns(
        null,
        null,
        null,
        {},
        { includeActions: false, includeNotes: false, enableTagEditing: false },
      ),
    [],
  );

  const comparisonRows = useMemo(() => {
    const rows = [];
    if (incumbentProfile) {
      rows.push({
        ...incumbentProfile,
        id: `incumbent-${incumbentProfile.id}`,
        priority: 'Current',
        targetRole: activePlan?.role || incumbentProfile.targetRole || '',
      });
    }
    candidateProfiles.forEach((candidate) => {
      if (!candidate.profile) return;
      rows.push({
        ...candidate.profile,
        id: `candidate-${candidate.id}`,
        priority: `Priority ${candidate.priority}`,
        targetRole: activePlan?.role || candidate.profile.targetRole || '',
      });
    });
    return rows;
  }, [incumbentProfile, candidateProfiles, activePlan]);

  const handleKpiChange = (event) => {
    const value = event.target.value;
    setSelectedKpis(value.length ? value : DEFAULT_KPIS);
  };

  const activePlanForChart = useMemo(() => {
    if (!activePlan) return null;
    const baseName = activePlan.incumbent?.name || getFullName(incumbentProfile);
    const incumbentName = baseName ? `${baseName} (Current)` : 'Current';
    return {
      ...activePlan,
      incumbent: {
        ...activePlan.incumbent,
        name: incumbentName,
      },
      candidates: (activePlan.candidates || []).map((candidate) => ({
        ...candidate,
        name: candidate.name || getFullName(staffIndex.get(String(candidate.id))),
      })),
    };
  }, [activePlan, incumbentProfile, staffIndex]);

  const renderKpiCards = () => {
    return selectedKpis.map((kpiId) => {
      const definition = KPI_OPTIONS.find((option) => option.id === kpiId);
      if (!definition) return null;
      const incumbentValue = definition.getValue(incumbentProfile);
      const leadingCandidate = candidateProfiles.reduce(
        (best, candidate) => {
          const value = definition.getValue(candidate.profile);
          if (value === null || value === undefined) return best;
          if (!best || value > best.value) {
            return { ...candidate, value };
          }
          return best;
        },
        null,
      );
      const delta = incumbentValue !== null && incumbentValue !== undefined && leadingCandidate?.value !== undefined
        ? Math.round((leadingCandidate.value - incumbentValue) * 10) / 10
        : null;

      return (
        <Grid item xs={12} sm={6} md={4} lg={3} key={kpiId}>
          <Paper
            elevation={0}
            sx={{
              border: '1px solid var(--color-border-primary)',
              borderRadius: 1,
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {definition.label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
              {definition.formatter(incumbentValue)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current: {getFullName(incumbentProfile)}
            </Typography>
            {leadingCandidate ? (
              <Box sx={{ mt: 'auto' }}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Top candidate
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {leadingCandidate.name || getFullName(leadingCandidate.profile)} · {definition.formatter(leadingCandidate.value)}
                </Typography>
                {delta !== null && (
                  <Chip
                    label={`Δ ${delta > 0 ? '+' : ''}${delta}`}
                    size="small"
                    sx={{ mt: 1, bgcolor: delta >= 0 ? 'var(--color-success-background)' : 'var(--color-error-background)' }}
                  />
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
                No candidate data available
              </Typography>
            )}
          </Paper>
        </Grid>
      );
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0, width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid var(--color-border-primary)',
          borderRadius: 1,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          minWidth: 0,
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={selectedPlanId || ''}
              onChange={(event) => setSelectedPlanId(event.target.value)}
            >
              {planOptions.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  {plan.role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel>Focus KPIs</InputLabel>
            <Select
              label="Focus KPIs"
              multiple
              value={selectedKpis}
              onChange={handleKpiChange}
              renderValue={(selected) =>
                selected.map((id) => KPI_OPTIONS.find((opt) => opt.id === id)?.label).join(', ')
              }
            >
              {KPI_OPTIONS.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {activePlan?.role || 'Succession Plan'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last updated {formatDate(activePlan?.lastUpdated)} · {candidateProfiles.length} candidates tracked
            </Typography>
          </Box>
          <Chip label={`Coverage ${coverageScore}%`} color="primary" />
          <Chip label={`${readinessBuckets.readyNow} ready now`} variant="outlined" />
          <Chip label={`${readinessBuckets.readySoon} ready soon`} variant="outlined" />
          <Chip label={`${readinessBuckets.emerging} emerging`} variant="outlined" />
        </Box>
      </Paper>

      <Grid container spacing={2} sx={{ width: '100%', m: 0 }}>
        {renderKpiCards()}
      </Grid>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid var(--color-border-primary)',
          borderRadius: 1,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          minWidth: 0,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Trajectory over time
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tracking the last six months of {selectedTimelineMetric?.label?.toLowerCase() || 'performance'} for current vs. shortlist.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip label="Last 6 months" size="small" color="default" />
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Timeline Metric</InputLabel>
              <Select
                label="Timeline Metric"
                value={timelineMetric}
                onChange={(event) => setTimelineMetric(event.target.value)}
              >
                {TIMELINE_METRICS.map((metric) => (
                  <MenuItem key={metric.id} value={metric.id}>
                    {metric.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {timelineData.length > 0 ? (
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <Box sx={{ minWidth: 640, height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="period" stroke="#666" />
                  <YAxis
                    stroke="#666"
                    allowDecimals
                    domain={[selectedTimelineMetric?.min ?? 'auto', selectedTimelineMetric?.max ?? 'auto']}
                  />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: 8, borderColor: 'var(--color-border-primary)' }}
                    formatter={(value) => value}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend />
                  {timelinePeople.map((person, index) => (
                    <Line
                      key={person.key}
                      type="monotone"
                      dataKey={person.displayName}
                      stroke={TIMELINE_COLORS[index % TIMELINE_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Select at least one candidate to unlock trajectory insights.
          </Typography>
        )}
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid var(--color-border-primary)',
          borderRadius: 1,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          minWidth: 0,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Full talent profile (current vs. pipeline)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Includes the same columns available in Watchlist to keep evaluations consistent.
        </Typography>
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Box sx={{ minWidth: 720 }}>
            <DataGridPro
              autoHeight
              rows={comparisonRows}
              columns={comparisonColumns}
              disableRowSelectionOnClick
              checkboxSelection={false}
              hideFooterSelectedRowCount
              initialState={{
                pagination: { paginationModel: { pageSize: 8 } },
                columns: { columnVisibilityModel: COMPARISON_COLUMN_VISIBILITY },
              }}
              pageSizeOptions={[8, 16, 32]}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  borderBottom: '1px solid var(--color-border-primary)',
                  backgroundColor: 'var(--color-background-secondary)',
                },
              }}
            />
          </Box>
        </Box>
      </Paper>

      {activePlanForChart && (
        <Paper
          elevation={0}
          sx={{
            border: '1px solid var(--color-border-primary)',
            borderRadius: 1,
            p: 3,
            minWidth: 0,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Benchmark vs. current role
            </Typography>
            <Tooltip title="Radar uses shared depth-chart metrics to keep comparisons consistent">
              <Chip label="Shared KPI set" size="small" />
            </Tooltip>
          </Box>
          <ComparisonSpiderChart plan={activePlanForChart} staffData={staffPool} />
        </Paper>
      )}
    </Box>
  );
}

export default SuccessionPlanningAnalysis;
