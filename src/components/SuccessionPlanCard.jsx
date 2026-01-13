import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Paper, Select, MenuItem, FormControl, InputLabel, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayerAvatar from './PlayerAvatar';
import WarningIcon from '@mui/icons-material/Warning';

const isOutdated = (lastUpdated) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return new Date(lastUpdated) < sixMonthsAgo;
};

const SuccessionPlanCard = ({ plan, onAddCandidate, onRemoveCandidate, watchlistCandidates, talentDBCandidates, onDragStart, onDragEnter }) => {
  const outdated = isOutdated(plan.lastUpdated);
  const navigate = useNavigate();

  const handleProfileClick = (id) => {
    navigate(`/staff/${id}`);
  };

  return (
    <Card style={{ 
        border: outdated ? '2px solid orange' : 'none' 
    }}>
      <CardContent>
        <Typography variant="h6" component="div">
          {plan.role}
          {outdated && <WarningIcon style={{ color: 'orange', marginLeft: '10px' }}/>}
        </Typography>
        <div 
          style={{ display: 'flex', alignItems: 'center', margin: '10px 0', cursor: 'pointer' }}
          onClick={() => handleProfileClick(plan.incumbent.id)}
        >
          <PlayerAvatar src={plan.incumbent.picUrl} playerId={plan.incumbent.id} playerName={plan.incumbent.name} />
          <div style={{ marginLeft: '10px' }}>
            <Typography variant="body1">{plan.incumbent.name}</Typography>
            <Typography variant="caption">Incumbent</Typography>
          </div>
        </div>
        
        <Typography variant="h6" style={{ marginTop: '20px' }}>Future Candidates</Typography>
        <Paper 
            style={{ padding: '10px', minHeight: '150px' }}
            onDragEnter={(e) => onDragEnter(e, plan.id, plan.candidates.length)}
        >
          {plan.candidates.map((candidate, index) => (
            <div
              key={candidate.id}
              draggable
              onDragStart={(e) => onDragStart(e, plan.id, index)}
              onDragEnter={(e) => onDragEnter(e, plan.id, index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
                padding: '5px',
                backgroundColor: 'white',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'grab' }} onClick={() => handleProfileClick(candidate.id)}>
                <Typography style={{marginRight: "10px"}}>{index + 1}.</Typography>
                <PlayerAvatar src={candidate.picUrl} playerId={candidate.id} playerName={candidate.name} />
                <Typography style={{ marginLeft: '10px' }}>{candidate.name}</Typography>
              </div>
              <IconButton size="small" onClick={() => onRemoveCandidate(plan.id, candidate.id)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          ))}
        </Paper>

        <FormControl fullWidth style={{ marginTop: '20px' }} disabled={plan.candidates.length >= 3}>
          <InputLabel>Add Candidate</InputLabel>
          <Select
            label="Add Candidate"
            onChange={(e) => onAddCandidate(plan.id, e.target.value)}
            value=""
          >
            <MenuItem value="" disabled><em>Select a person...</em></MenuItem>
            <Typography variant="caption" style={{paddingLeft: "15px"}}>Watchlist</Typography>
            {watchlistCandidates.map(c => <MenuItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</MenuItem>)}
            <Typography variant="caption" style={{paddingLeft: "15px"}}>Talent Database</Typography>
            {talentDBCandidates.map(c => <MenuItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</MenuItem>)}
          </Select>
        </FormControl>

      </CardContent>
    </Card>
  );
};

export default SuccessionPlanCard;
