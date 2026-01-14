import React, { useState, useEffect, useRef } from 'react';
import clubStaffData from '../data/users_staff.json';
import staffData from '../data/staff_talent.json';
import SuccessionPlanCard from '../components/SuccessionPlanCard';
import PlayerAvatar from '../components/PlayerAvatar';
import OutdatedNotification from '../components/OutdatedNotification';
import { Typography, Grid, Drawer, Box, IconButton, Checkbox } from '@mui/material'; // Added Button
import MedinahButton from '../components/Button';
import ChevronRightIcon from '@mui/icons-material/ChevronRight'; // Added for close button
import ComparisonSpiderChart from '../components/ComparisonSpiderChart'; // Import new component

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

const drawerWidth = '60%'; // Define a width for the drawer (60% of screen)

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
  const [isComparisonDrawerOpen, setIsComparisonDrawerOpen] = useState(true); // Drawer open by default
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlans && initialPlans.length ? initialPlans[0].id : null); // Default to first plan for comparison
  const [openAddDrawerPlanId, setOpenAddDrawerPlanId] = useState(null); // plan id for add-drawer
  const [addDrawerSelection, setAddDrawerSelection] = useState([]); // selected staff ids in add drawer

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

  const handleDrawerClose = () => {
    setIsComparisonDrawerOpen(false);
  };

  const handleCardClick = (planId) => {
    setSelectedPlanId(planId);
    setIsComparisonDrawerOpen(true);
  };

  const handleOpenAddDrawer = (planId) => {
    setOpenAddDrawerPlanId(planId);
    const plan = plans.find(p => p.id === planId);
    const preselected = plan ? plan.candidates.map(c => c.id) : [];
    setAddDrawerSelection(preselected);
  };

  const handleCloseAddDrawer = () => {
    setOpenAddDrawerPlanId(null);
    setAddDrawerSelection([]);
  };

  const toggleSelectStaffForAdd = (staffId) => {
    setAddDrawerSelection(prev => {
      if (prev.includes(staffId)) return prev.filter(id => id !== staffId);
      if (prev.length >= 3) return prev; // enforce max 3
      return [...prev, staffId];
    });
  };

  const handleConfirmAddSelection = () => {
    if (!openAddDrawerPlanId) return;
    addDrawerSelection.forEach(staffId => handleAddCandidate(openAddDrawerPlanId, staffId));
    handleCloseAddDrawer();
  };

  const watchlistCandidates = React.useMemo(() => {
    return staffData.filter(s => s.tags?.includes('Watchlist'));
  }, [staffData]);

  const talentDBCandidates = React.useMemo(() => {
    return staffData.filter(s => !s.tags?.includes('Watchlist'));
  }, [staffData]);

  // Get selected plan and its candidates for comparison
  const selectedPlan = selectedPlanId ? plans.find(p => p.id === selectedPlanId) : null;

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)', mt: -2, mr: 0, mb: 0, ml: 0, p: 0 }}>
      {/* Left Panel - Cards */}
      <Box
        sx={{
          width: isComparisonDrawerOpen ? '66.67%' : '100%',
          maxWidth: isComparisonDrawerOpen ? '66.67vw' : '100%',
          mr: isComparisonDrawerOpen ? '33.33vw' : 0,
          minWidth: isComparisonDrawerOpen ? '600px' : 0,
          pt: 1,
          pr: 2,
          pb: 3,
          pl: 2,
          overflow: 'auto',
          transition: 'width 0.3s ease',
        }}
      >
        {showNotification && <OutdatedNotification onClose={() => setShowNotification(false)} />}

        <Grid container spacing={3}>
          {plans.map(plan => (
            <Grid item key={plan.id} xs={12} sm={isComparisonDrawerOpen ? 6 : 6} md={isComparisonDrawerOpen ? 6 : 4} lg={isComparisonDrawerOpen ? 6 : 4} xl={isComparisonDrawerOpen ? 6 : 3}>
              <SuccessionPlanCard
                plan={plan}
                onAddCandidate={handleAddCandidate}
                onRemoveCandidate={handleRemoveCandidate}
                watchlistCandidates={watchlistCandidates}
                talentDBCandidates={talentDBCandidates}
                onDragStart={handleDragStart}
                onDragEnter={handleDragEnter}
                onCardClick={handleCardClick}
                isSelected={selectedPlanId === plan.id}
                onOpenAddDrawer={handleOpenAddDrawer}
                originTab={1}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Right Panel - Comparison Chart */}
      {isComparisonDrawerOpen && (
        <Box
          sx={{
            position: 'fixed',
            right: 0,
            top: 0,
            width: '33.33vw',
            height: '100vh',
            borderLeft: '1px solid #e0e0e0',
            overflow: 'auto',
            bgcolor: 'background.paper',
            pt: 0,
            pr: 2,
            pb: 3,
            pl: 2,
            zIndex: 1200,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1,
              borderBottom: '1px solid #e0e0e0',
              position: 'sticky',
              top: 0,
              bgcolor: 'background.paper',
              zIndex: 1,
            }}
          >
            <Typography variant="h5" component="div">
              {selectedPlan ? selectedPlan.role : 'Role Comparison'}
            </Typography>
            <IconButton onClick={handleDrawerClose}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
          <Box sx={{ px: 2, pt: 1, pb: 2 }}>
            {selectedPlan ? (
              <>
                <ComparisonSpiderChart 
                  plan={selectedPlan} 
                  staffData={staffData}
                />
              </>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center'
              }}>
                <Typography color="text.secondary">
                  Select a role card to view candidate comparisons
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Add Candidates Drawer (right side) */}
      <Drawer
        anchor="right"
        open={!!openAddDrawerPlanId}
        onClose={handleCloseAddDrawer}
        PaperProps={{ sx: { width: '33.33vw', maxWidth: '480px', display: 'flex', flexDirection: 'column', height: '100%' } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6">Add Candidates</Typography>
          <IconButton onClick={handleCloseAddDrawer}><ChevronRightIcon /></IconButton>
        </Box>

        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <Typography variant="caption" display="block" gutterBottom>Choose up to 3 staff to add as future candidates</Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Typography variant="subtitle2">Selected:</Typography>
            <Typography>{addDrawerSelection.length} / 3</Typography>
          </Box>

          <Box sx={{ overflow: 'auto', flex: 1 }}>
            {staffData.map(s => (
              <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, borderBottom: '1px solid #f0f0f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PlayerAvatar src={s.picUrl} playerId={s.id} playerName={`${s.firstName} ${s.lastName}`} />
                  <Box>
                    <Typography>{s.firstName} {s.lastName}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.position || s.role || ''}</Typography>
                  </Box>
                </Box>
                <Checkbox
                  checked={addDrawerSelection.includes(s.id)}
                  onChange={() => toggleSelectStaffForAdd(s.id)}
                  disabled={!addDrawerSelection.includes(s.id) && addDrawerSelection.length >= 3}
                />
              </Box>
            ))}
          </Box>

        </Box>

        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <MedinahButton variant="secondary" onClick={handleCloseAddDrawer}>Cancel</MedinahButton>
            <MedinahButton variant="primary" disabled={addDrawerSelection.length === 0} onClick={handleConfirmAddSelection}>Add {addDrawerSelection.length > 0 ? `(${addDrawerSelection.length})` : ''}</MedinahButton>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default SuccessionPlanning;