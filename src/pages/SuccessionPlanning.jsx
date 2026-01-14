import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import clubStaffData from '../data/users_staff.json';
import staffData from '../data/staff_talent.json';
import SuccessionPlanCard from '../components/SuccessionPlanCard';
import PlayerAvatar from '../components/PlayerAvatar';
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
  const navigate = useNavigate();
  const location = useLocation();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const initialPlans = clubStaffData.map(staff => ({
    id: `sp-${staff.id}`,
    role: staff.role,
    incumbent: {
      id: staff.id,
      name: `${staff.firstname} ${staff.lastname}`,
      picUrl: staff.profilePic,
    },
    candidates: getRandomCandidates(staff.id, 3),
    lastUpdated: staff.role === 'Strength & Conditioning Coach' ? oneYearAgo.toISOString() : new Date().toISOString(),
  }));

  const [plans, setPlans] = useState(initialPlans);
  
  const [isComparisonDrawerOpen, setIsComparisonDrawerOpen] = useState(true); // Drawer open by default
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlans && initialPlans.length ? initialPlans[0].id : null); // Default to first plan for comparison
  const [openAddDrawerPlanId, setOpenAddDrawerPlanId] = useState(null); // plan id for add-drawer
  const [addDrawerSelection, setAddDrawerSelection] = useState([]); // selected staff ids in add drawer
  const isLeagueView = location.pathname.startsWith('/league');

  // Drag and Drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [sourcePlanId, setSourcePlanId] = useState(null);
  const dragItemNode = useRef();

  // we rely on per-card chips and snackbars for outdated notifications

  const handleDragStart = (e, planId, candidateIndex) => {
    // Store source info in dataTransfer for reliable cross-element drops
    const payload = JSON.stringify({ planId, candidateIndex });
    try { e.dataTransfer.setData('application/json', payload); } catch (err) { /* some browsers may restrict */ }
    setDraggedItem(plans.find(p => p.id === planId).candidates[candidateIndex]);
    setSourcePlanId(planId);
    dragItemNode.current = e.target;
    dragItemNode.current.addEventListener('dragend', handleDragEnd);
    setTimeout(() => { e.target.style.opacity = 0.5; }, 0);
  };

  const handleDrop = (e, targetPlanId, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    // Try to read structured payload
    let payload = null;
    try { payload = JSON.parse(e.dataTransfer.getData('application/json')); } catch (err) { payload = null; }
    // Fallback: if we don't have structured payload, use current state
    const srcPlanId = payload?.planId ?? sourcePlanId;
    const srcIndex = payload?.candidateIndex ?? (draggedItem ? draggedItem.priority - 1 : null);
    if (!srcPlanId || srcIndex === null || srcIndex === undefined) return;

    setPlans(oldPlans => {
      const newPlans = JSON.parse(JSON.stringify(oldPlans));
      const sourcePlan = newPlans.find(p => p.id === srcPlanId);
      const targetPlan = newPlans.find(p => p.id === targetPlanId);
      if (!sourcePlan || !targetPlan) return oldPlans;

      const [moved] = sourcePlan.candidates.splice(srcIndex, 1);
      if (!moved) return oldPlans;

      targetPlan.candidates.splice(targetIndex, 0, moved);

      // reassign priorities
      sourcePlan.candidates.forEach((c, i) => { c.priority = i + 1; });
      targetPlan.candidates.forEach((c, i) => { c.priority = i + 1; });

      return newPlans.map(p => ({ ...p, lastUpdated: p.id === sourcePlan.id || p.id === targetPlan.id ? new Date().toISOString() : p.lastUpdated }));
    });
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
    setSelectedPlanId(null);
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

  const handleSeeMoreDetails = () => {
    if (!selectedPlan) return;
    const targetPath = isLeagueView ? '/league/analysis' : '/analysis';
    navigate(targetPath, {
      state: {
        analysisTab: 'successionPlanning',
        successionContext: {
          planId: selectedPlan.id,
          role: selectedPlan.role,
          plan: selectedPlan,
          incumbent: selectedPlan.incumbent,
          candidates: selectedPlan.candidates,
          lastUpdated: selectedPlan.lastUpdated,
        },
      },
    });
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
        {/* Outdated page-level banner removed — card-level chips provide notifications */}

        <Grid container spacing={3}>
          {plans.map((plan, idx) => (
            <Grid item key={plan.id} xs={12} sm={isComparisonDrawerOpen ? 6 : 6} md={isComparisonDrawerOpen ? 6 : 4} lg={isComparisonDrawerOpen ? 6 : 4} xl={isComparisonDrawerOpen ? 6 : 3}>
              <SuccessionPlanCard
                plan={plan}
                onAddCandidate={handleAddCandidate}
                onRemoveCandidate={handleRemoveCandidate}
                watchlistCandidates={watchlistCandidates}
                talentDBCandidates={talentDBCandidates}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                onCardClick={handleCardClick}
                isSelected={selectedPlanId === plan.id}
                onOpenAddDrawer={handleOpenAddDrawer}
                originTab={1}
                highlightNeedsRefresh={plan.role === 'Strength & Conditioning Coach'}
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
              {selectedPlan ? (selectedPlan.role === 'Strength & Conditioning Coach' ? 'S+C' : selectedPlan.role) : 'Role Comparison'}
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
                <MedinahButton
                  variant="primary"
                  onClick={handleSeeMoreDetails}
                  sx={{ mt: 2, width: '100%' }}
                >
                  See more details
                </MedinahButton>
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