import { Box, Typography, Paper, Button, Dialog, FormControlLabel, Switch, TextField, Divider, IconButton, DialogActions, DialogTitle, Alert } from '@mui/material';
import { useState, useCallback, memo, useEffect } from 'react';
import { CulturalActivity, Participant, Judge } from '@common/models';
import { ParticipantsForm } from '.';
import { JudgesForm } from './CulturalsView/JudgesForm';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { v4 as uuidv4 } from 'uuid';

interface CulturalsViewProps {
  formData: CulturalActivity;
  setFormData: (data: CulturalActivity) => void;
}

// Dialog contents as separate components for better performance
const DialogContent = memo<{
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}>(({ title, children, onClose }) => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h6" sx={{ mb: 3 }}>{title}</Typography>
    {children}
    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
      <Button onClick={onClose} variant="contained">Done</Button>
    </Box>
  </Box>
));

// Summary section to avoid re-renders
const SummarySection = memo<{ label: string, count: number }>(({ label, count }) => (
  <Typography>
    {count === 0
      ? `No ${label} configured yet`
      : `${count} ${label}${count > 1 ? 's' : ''} configured`}
  </Typography>
));

// Team item component for the team list
const TeamItem = memo<{ 
  team: { id: string, name: string }, 
  onEdit: (team: { id: string, name: string }) => void, 
  onDelete: (id: string) => void 
}>(({ team, onEdit, onDelete }) => (
  <Box 
    display="flex" 
    justifyContent="space-between" 
    alignItems="center" 
    sx={{ 
      p: 1.5, 
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      '&:last-child': { borderBottom: 'none' } 
    }}
  >
    <Typography variant="body2">{team.name}</Typography>
    <Box>
      <IconButton size="small" onClick={() => onEdit(team)}>
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={() => onDelete(team.id)}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  </Box>
));

export const CulturalsView = ({ formData, setFormData }: CulturalsViewProps) => {
  // UI-specific state variables
  const [openParticipantsDialog, setOpenParticipantsDialog] = useState(false);
  const [openJudgesDialog, setOpenJudgesDialog] = useState(false);
  const [openTeamDialog, setOpenTeamDialog] = useState(false);
  const [editTeamIndex, setEditTeamIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  // UI state for solo performance toggle
  const [isSoloPerformanceUI, setIsSoloPerformanceUI] = useState<boolean>(formData.isSoloPerformance || false);
  
  // Store team editing data directly in formData
  const [currentTeam, setCurrentTeam] = useState<{ id: string, name: string }>({ id: '', name: '' });
  
  // Extract directly from formData
  const teams = formData.teams || [];
  const participants = formData.participants || [];
  const judges = formData.judges || [];
  
  // Keep UI state in sync with formData
  useEffect(() => {
    setIsSoloPerformanceUI(formData.isSoloPerformance || false);
  }, [formData.isSoloPerformance]);
  
  const handleChange = (field: keyof CulturalActivity, value: any) => {
    setFormData(CulturalActivity.parse({
      ...formData,
      [field]: value
    }));
  };

  const handleSoloPerformanceToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newIsSoloPerformance = event.target.checked;
    setIsSoloPerformanceUI(newIsSoloPerformance);
    
    if (newIsSoloPerformance) {
      // In solo mode, create teams from participants
      const soloTeams = participants.map(p => ({ 
        id: p.usn || `participant-${p.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`, 
        name: p.name 
      }));
      
      // Keep existing teams and add solo teams without duplicates
      const existingTeamNames = new Set(teams.map(t => t.name));
      const uniqueSoloTeams = soloTeams.filter(t => !existingTeamNames.has(t.name));
      const mergedTeams = [...teams, ...uniqueSoloTeams];
      
      // Update form data with merged teams and solo flag
      setFormData(CulturalActivity.parse({
        ...formData,
        teams: mergedTeams,
        isSoloPerformance: true
      }));
    } else {
      // Just update the solo flag, keep teams intact
      setFormData(CulturalActivity.parse({
        ...formData,
        isSoloPerformance: false
      }));
    }
  };

  const handleOpenTeamDialog = (team?: { id: string, name: string }) => {
    if (team) {
      // Edit existing team
      setCurrentTeam(team);
      setEditTeamIndex(teams.findIndex(t => t.id === team.id));
    } else {
      // Add new team
      setCurrentTeam({ id: '', name: '' });
      setEditTeamIndex(null);
    }
    setOpenTeamDialog(true);
  };

  const handleCloseTeamDialog = () => {
    setOpenTeamDialog(false);
  };

  const handleSaveTeam = () => {
    if (!currentTeam.name.trim()) return;
    
    const newTeam = {
      id: currentTeam.id || `team-${Date.now()}`,
      name: currentTeam.name.trim()
    };
    
    const updatedTeams = [...teams];
    if (editTeamIndex !== null) {
      updatedTeams[editTeamIndex] = newTeam;
    } else {
      updatedTeams.push(newTeam);
    }
    
    handleChange('teams', updatedTeams);
    handleCloseTeamDialog();
  };

  const handleDeleteTeam = (teamId: string) => {
    const updatedTeams = teams.filter(team => team.id !== teamId);
    handleChange('teams', updatedTeams);
  };

  const handleParticipantsChange = (newParticipants: Participant[]) => {
    // Update participants in the form data
    handleChange('participants', newParticipants);
    
    // If it's a solo performance, automatically update teams based on participants
    if (isSoloPerformanceUI) {
      const soloTeams = newParticipants.map(p => ({ 
        id: p.usn || `participant-${p.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`, 
        name: p.name 
      }));
      
      // Non-destructive update - preserve teams that don't represent participants
      const existingNonSoloTeams = teams.filter(team => 
        !participants.some(p => p.name === team.name)
      );
      
      const mergedTeams = [...existingNonSoloTeams, ...soloTeams];
      handleChange('teams', mergedTeams);
    }
  };

  const handleJudgesChange = (newJudges: Judge[]) => {
    // Update judges directly in the form data
    handleChange('judges', newJudges);
  };

  const handleOpenParticipantsDialog = () => {
    setError(null); // Clear any previous errors
    setOpenParticipantsDialog(true);
  };

  return (
    <Box>
      {/* Judges Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Judges</Typography>
          <Button
            variant="contained"
            onClick={() => setOpenJudgesDialog(true)}
            size="small"
          >
            Manage Judges
          </Button>
        </Box>

        <SummarySection label="judge" count={judges.length} />

        <Dialog
          open={openJudgesDialog}
          onClose={() => setOpenJudgesDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent title="Manage Judges" onClose={() => setOpenJudgesDialog(false)}>
            <JudgesForm 
              judges={judges} 
              setJudges={handleJudgesChange}
            />
          </DialogContent>
        </Dialog>
      </Paper>
      
      {/* Teams Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Teams</Typography>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={isSoloPerformanceUI}
                  onChange={handleSoloPerformanceToggle}
                  color="primary"
                />
              }
              label="Solo Performance"
            />
            {!isSoloPerformanceUI && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenTeamDialog()}
                size="small"
                sx={{ ml: 2 }}
              >
                Add Team
              </Button>
            )}
          </Box>
        </Box>

        {teams.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            {isSoloPerformanceUI
              ? "Participants will be treated as individual teams."
              : "No teams added yet. Click 'Add Team' to create teams for this event."}
          </Typography>
        ) : (
          <Box sx={{ mt: 2, maxHeight: 300, overflow: 'auto', border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: 1 }}>
            {teams.map((team) => (
              <TeamItem 
                key={team.id} 
                team={team} 
                onEdit={isSoloPerformanceUI ? () => {} : (team) => handleOpenTeamDialog(team)}
                onDelete={isSoloPerformanceUI ? () => {} : handleDeleteTeam}
              />
            ))}
          </Box>
        )}

        {isSoloPerformanceUI && teams.length > 0 && (
          <Typography variant="body2" color="info.main" sx={{ mt: 2, fontSize: '0.8rem' }}>
            * In solo performance mode, each participant is automatically treated as their own team.
          </Typography>
        )}

        <Dialog open={openTeamDialog} onClose={handleCloseTeamDialog} maxWidth="xs" fullWidth>
          <DialogTitle>{editTeamIndex !== null ? 'Edit Team' : 'Add Team'}</DialogTitle>
          <DialogContent 
            title={editTeamIndex !== null ? 'Edit Team' : 'Add Team'} 
            onClose={handleCloseTeamDialog}
          >
            <TextField
              label="Team Name"
              value={currentTeam.name}
              onChange={(e) => setCurrentTeam({ ...currentTeam, name: e.target.value })}
              fullWidth
              autoFocus
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseTeamDialog}>Cancel</Button>
            <Button 
              onClick={handleSaveTeam} 
              variant="contained"
              disabled={!currentTeam.name.trim()}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>

      {/* Participants Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Participants</Typography>
          <Button
            variant="contained"
            onClick={handleOpenParticipantsDialog}
            size="small"
          >
            Manage Participants
          </Button>
        </Box>

        <SummarySection label="participant" count={participants.length} />

        <Dialog
          open={openParticipantsDialog}
          onClose={() => setOpenParticipantsDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent
            title={`Manage Participants ${isSoloPerformanceUI ? '(Solo Mode)' : ''}`}
            onClose={() => setOpenParticipantsDialog(false)}
          >
            <ParticipantsForm
              participants={participants}
              setParticipants={handleParticipantsChange} 
              teams={!isSoloPerformanceUI ? teams : []}
            />
          </DialogContent>
        </Dialog>
      </Paper>
      
      {/* Audience Polling Section */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Audience Polling</Typography>
        
        <FormControlLabel
          control={
            <Switch 
              checked={formData.showPoll || false}
              onChange={(e) => handleChange('showPoll', e.target.checked)}
              color="primary"
            />
          }
          label="Enable audience polling for this activity"
        />
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
          When enabled, users will be able to vote for their favorite participants in this activity.
          Voting results will be visible in real-time to the audience.
        </Typography>
        
        {formData.showPoll && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Polling Enabled
            </Typography>
            <Typography variant="body2">
              • Audience members will be able to cast votes during this activity.<br />
              • Each user can vote only once.<br />
              • Results will update in real-time.<br />
              • You can disable polling at any time.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};