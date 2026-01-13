import React, { useState, useEffect, useRef } from 'react';
import clubStaffData from '../data/users_staff.json';
import staffData from '../data/staff_talent.json';
import SuccessionPlanCard from '../components/SuccessionPlanCard';
import OutdatedNotification from '../components/OutdatedNotification';
import { Typography, Grid } from '@mui/material';

// Helper to get random candidates
const getRandomCandidates = (incumbentId, count) => {
  const candidates = [];
  const availableStaff = staffData.filter(staff => staff.id !== incumbentId);
  while (candidates.length < count && availableStaff.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableStaff.length);
    const selectedCandidate = availableStaff.splice(randomIndex, 1)[0];
    candidates.push({
      id: selectedCandidate.id,
      name: `${selectedCandidate.firstName} ${selectedCandidate.lastName}`,
      picUrl: selectedCandidate.picUrl,
      priority: candidates.length + 1,
    });
  }
  return candidates;
};

const SuccessionPlanning = () => {
  const initialPlans = clubStaffData.map(staff => ({
    id: `sp-${staff.id}`,
    role: staff.role,
    incumbent: {
      id: staff.id,
      name: `${staff.firstname} ${staff.lastname}`,
      picUrl: staff.profilePic,
    },
    candidates: getRandomCandidates(staff.id, 3),
    lastUpdated: new Date().toISOString(),
  }));

  const [plans, setPlans] = useState(initialPlans);
  const [showNotification, setShowNotification] = useState(false);

  // Drag and Drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [sourcePlanId, setSourcePlanId] = useState(null);
  const dragItemNode = useRef();

  useEffect(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const hasOutdated = plans.some(plan => new Date(plan.lastUpdated) < sixMonthsAgo);
    if (hasOutdated) {
      setShowNotification(true);
    }
  }, [plans]);

  const handleDragStart = (e, planId, candidateIndex) => {
    setDraggedItem(plans.find(p => p.id === planId).candidates[candidateIndex]);
    setSourcePlanId(planId);
    dragItemNode.current = e.target;
    dragItemNode.current.addEventListener('dragend', handleDragEnd);
    setTimeout(() => {
      // Make the dragged item invisible
      e.target.style.opacity = 0.5;
    }, 0);
  };
  
  const handleDragEnter = (e, planId, candidateIndex) => {
    if (dragItemNode.current !== e.target) {
        setPlans(oldPlans => {
            let newPlans = JSON.parse(JSON.stringify(oldPlans));
            const sourcePlan = newPlans.find(p => p.id === sourcePlanId);
            const [movedItem] = sourcePlan.candidates.splice(draggedItem.priority -1, 1);
            
            const targetPlan = newPlans.find(p => p.id === planId);
            targetPlan.candidates.splice(candidateIndex, 0, movedItem);

            // re-assign priorities
            sourcePlan.candidates.forEach((c, i) => c.priority = i + 1);
            targetPlan.candidates.forEach((c, i) => c.priority = i + 1);
            
            setDraggedItem(movedItem);
            setSourcePlanId(planId);
            return newPlans;
        });
    }
  };


  const handleDragEnd = (e) => {
    e.target.style.opacity = 1;
    setDraggedItem(null);
    setSourcePlanId(null);
    dragItemNode.current.removeEventListener('dragend', handleDragEnd);
    dragItemNode.current = null;
    
    // Update timestamp
    setPlans(oldPlans => oldPlans.map(p => ({...p, lastUpdated: new Date().toISOString() })));
  };

  const handleAddCandidate = (planId, candidateId) => {
    const candidate = staffData.find(staff => staff.id === candidateId);
    if (!candidate) return;

    const newPlans = plans.map(plan => {
      if (plan.id === planId) {
        if (plan.candidates.some(c => c.id === candidate.id) || plan.candidates.length >= 3) return plan;
        
        const newCandidate = {
          id: candidate.id,
          name: `${candidate.firstName} ${candidate.lastName}`,
          picUrl: candidate.picUrl,
          priority: plan.candidates.length + 1,
        };
        return {
          ...plan,
          candidates: [...plan.candidates, newCandidate],
          lastUpdated: new Date().toISOString(),
        };
      }
      return plan;
    });
    setPlans(newPlans);
  };

  const handleRemoveCandidate = (planId, candidateId) => {
    const newPlans = plans.map(plan => {
      if (plan.id === planId) {
        return {
          ...plan,
          candidates: plan.candidates.filter(c => c.id !== candidateId),
          lastUpdated: new Date().toISOString(),
        };
      }
      return plan;
    });
    setPlans(newPlans);
  };

  const watchlistCandidates = staffData.filter(s => s.tags?.includes('Watchlist'));
  const talentDBcandidates = staffData.filter(s => !s.tags?.includes('Watchlist'));

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>Succession Planning</Typography>
      {showNotification && <OutdatedNotification onClose={() => setShowNotification(false)} />}
      <Grid container spacing={3}>
        {plans.map(plan => (
          <Grid item key={plan.id} xs={12} sm={6} md={4} lg={3} xl={3}>
            <SuccessionPlanCard
              plan={plan}
              onAddCandidate={handleAddCandidate}
              onRemoveCandidate={handleRemoveCandidate}
              watchlistCandidates={watchlistCandidates}
              talentDBCandidates={talentDBcandidates}
              onDragStart={handleDragStart}
              onDragEnter={handleDragEnter}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default SuccessionPlanning;
