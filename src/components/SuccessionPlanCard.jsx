import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, Typography, Paper, Select, MenuItem, FormControl, InputLabel, IconButton, Box, Chip, Snackbar, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayerAvatar from './PlayerAvatar';
import MedinahButton from './Button';

const isOutdated = (lastUpdated) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return new Date(lastUpdated) < sixMonthsAgo;
};

const SuccessionPlanCard = ({ plan, onAddCandidate, onRemoveCandidate, watchlistCandidates, talentDBCandidates, onDragStart, onDrop, onCardClick, isSelected, onOpenAddDrawer, originTab, highlightNeedsRefresh }) => {
  const outdated = isOutdated(plan.lastUpdated) || !!highlightNeedsRefresh;
  const navigate = useNavigate();
  const location = useLocation();
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  const handleProfileClick = (e, id) => {
    e.stopPropagation(); // Prevent card click
    const from = { pathname: location.pathname, search: location.search };
    if (Number.isInteger(originTab)) {
      from.state = { activeTab: originTab };
    }
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[SuccessionPlanCard] navigating to profile with from:', from);
    }
    navigate(`/staff/${id}`, { state: { from } });
  };

  return (
    <Card 
      style={{ 
        border: isSelected ? '3px solid #1976d2' : (outdated ? '2px solid orange' : '1px solid #e0e0e0'),
        transition: 'all 0.2s ease',
        boxShadow: isSelected ? '0 4px 20px rgba(25, 118, 210, 0.3)' : undefined,
        height: '100%',
      }}
      sx={{}}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
            {plan.role === 'Strength & Conditioning Coach' ? 'S+C' : plan.role}
          </Typography>
          <div style={{ display: 'flex', gap: '8px' }}>
            {outdated && (
              <Chip
                label="Needs Refresh"
                color="warning"
                size="small"
                onClick={(e) => { e.stopPropagation(); setSnackbarOpen(true); }}
                sx={{ alignSelf: 'center' }}
              />
            )}
            <MedinahButton
              size="small"
              variant="secondary"
              onClick={(e) => { e.stopPropagation(); onCardClick(plan.id); }}
            >
              Compare
            </MedinahButton>
            <MedinahButton
              size="small"
              variant="primary"
              onClick={(e) => { e.stopPropagation(); if (typeof onOpenAddDrawer === 'function') onOpenAddDrawer(plan.id); }}
            >
              Add
            </MedinahButton>
          </div>
        </Box>
        <div 
          style={{ display: 'flex', alignItems: 'center', margin: '10px 0', cursor: 'pointer' }}
          onClick={(e) => handleProfileClick(e, plan.incumbent.id)}
        >
          <PlayerAvatar src={plan.incumbent.picUrl} playerId={plan.incumbent.id} playerName={plan.incumbent.name} />
          <div style={{ marginLeft: '10px' }}>
            <Typography variant="body1">{plan.incumbent.name}</Typography>
            <Typography variant="caption">Current</Typography>
          </div>
        </div>
        
        <Typography variant="h6" style={{ marginTop: '20px' }}>Future Candidates</Typography>
        <Paper 
          style={{ padding: '10px', minHeight: '150px' }}
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => { e.stopPropagation(); if (typeof onDrop === 'function') onDrop(e, plan.id, plan.candidates.length); }}
        >
              {plan.candidates.map((candidate, index) => (
              <Box
              key={candidate.id}
              draggable
              onDragStart={(e) => onDragStart(e, plan.id, index)}
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={(e) => { e.stopPropagation(); if (typeof onDrop === 'function') onDrop(e, plan.id, index); }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: '10px',
                p: '5px',
                backgroundColor: 'white',
                borderRadius: '6px',
                transition: 'background-color 150ms ease, transform 150ms ease',
                '&:hover': {
                  backgroundColor: '#f5f7fa',
                  transform: 'translateY(-1px)'
                },
                cursor: 'grab'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }} onClick={(e) => handleProfileClick(e, candidate.id)}>
                <Typography sx={{ mr: '10px' }}>{index + 1}.</Typography>
                <PlayerAvatar src={candidate.picUrl} playerId={candidate.id} playerName={candidate.name} />
                <Box sx={{ ml: '10px', display: 'flex', flexDirection: 'column' }}>
                  <Typography>{candidate.name}</Typography>
                  {
                    (() => {
                      const findIn = (arr) => (Array.isArray(arr) ? arr.find(s => String(s.id) === String(candidate.id)) : undefined);
                      const found = findIn(watchlistCandidates) || findIn(talentDBCandidates);
                      const rawEmployer = found?.currentEmployer || found?.current_employer || '';
                      // Try to extract the club/organization name before the first ' - '
                      let employer = rawEmployer;
                      if (typeof rawEmployer === 'string' && rawEmployer.length) {
                        if (rawEmployer.includes(' - ')) {
                          employer = rawEmployer.split(' - ')[0].trim();
                        } else {
                          // Fallback: remove trailing parenthetical dates like (2021-Present)
                          employer = rawEmployer.replace(/\s*\([^)]*\)\s*$/, '').trim();
                        }
                      }
                      return employer ? <Typography variant="caption" color="text.secondary">{employer}</Typography> : null;
                    })()
                  }
                </Box>
              </Box>
              <IconButton size="small" style={{ cursor: 'pointer' }} onClick={(e) => {
                e.stopPropagation();
                onRemoveCandidate(plan.id, candidate.id);
              }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Paper>

        {/* Add drawer is used instead of dropdown select for adding candidates */}

      </CardContent>
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="warning" sx={{ width: '100%' }}>
          Some of your succession plans are more than 6 months old. Please review and update them.
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default SuccessionPlanCard;
