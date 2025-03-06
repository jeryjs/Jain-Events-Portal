import { useState, useEffect } from 'react';
import { Box, Button, Dialog, Typography, FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';
import { TeamsForm } from './SportsView/TeamsForm';
import { ParticipantsForm } from './ParticipantsForm';
import { CricketForm } from './SportsView/Cricket';
import { GenericSport } from './SportsView/GenericSport';
import { SportsActivity } from '@common/models';
import { Cricket, OtherSport, Sport } from '@common/models/sports/SportsActivity';
import { EventType } from '@common/constants';

interface SportsViewProps {
  formData: SportsActivity<Sport>;
  setFormData: (data: SportsActivity<Sport>) => void;
}

export const SportsView = ({ formData, setFormData }: SportsViewProps) => {
  const [openTeamsDialog, setOpenTeamsDialog] = useState(false);
  const [openParticipantsDialog, setOpenParticipantsDialog] = useState(false);

  const teams = formData.teams || [];
  const participants = formData.participants || [];

  useEffect(() => {
    // Update parent form data when teams or participants change
    setFormData(formData);
  }, [teams, participants, formData.eventType]);

  const handleOpenTeamsDialog = () => {
    setOpenTeamsDialog(true);
  };

  const handleCloseTeamsDialog = () => {
    setOpenTeamsDialog(false);
  };

  const handleOpenParticipantsDialog = () => {
    setOpenParticipantsDialog(true);
  };

  const handleCloseParticipantsDialog = () => {
    setOpenParticipantsDialog(false);
  };

  const handleChange = (field: keyof SportsActivity<Sport>, value: any) => {
    setFormData(SportsActivity.parse({ ...formData, [field]: value }));
  }

  // Render sport-specific form based on selected sport
  const renderSportSpecificForm = () => {
    switch (formData.eventType) {
      case EventType.CRICKET: return <CricketForm formData={formData as SportsActivity<Cricket>} setFormData={setFormData} />;
      case EventType.FOOTBALL: return <GenericSport formData={formData as SportsActivity<OtherSport>} setFormData={setFormData} />;
      case EventType.BASKETBALL: return <GenericSport formData={formData} setFormData={setFormData} />;
      default: return <GenericSport formData={formData} setFormData={setFormData} />;
    }
  };

  return (
    <Box>
      {/* Teams Section */}
      <Paper elevation={1} sx={{ py: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Teams</Typography>
          <Button
            variant="contained"
            onClick={handleOpenTeamsDialog}
            size="small"
          >
            Manage Teams
          </Button>
        </Box>

        {/* Display teams summary */}
        <Typography>
          {teams.length === 0 ? (
            "No teams configured yet"
          ) : (
            `${teams.length} team${teams.length > 1 ? 's' : ''} configured`
          )}
        </Typography>

        {/* Teams Dialog */}
        <Dialog
          open={openTeamsDialog}
          onClose={handleCloseTeamsDialog}
          maxWidth="md"
          fullWidth
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Manage Teams</Typography>
            <TeamsForm teams={formData.teams} setTeams={newTeams => handleChange('teams', newTeams)} />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseTeamsDialog} variant="contained">Done</Button>
            </Box>
          </Box>
        </Dialog>
      </Paper>

      {/* Participants Section */}
      <Paper elevation={1} sx={{ py: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Participants</Typography>
          <Button
            variant="contained"
            onClick={handleOpenParticipantsDialog}
            disabled={teams.length === 0}
            size="small"
          >
            Manage Participants
          </Button>
        </Box>

        <Typography>
          {participants.length === 0 ? (
            "No participants added yet"
          ) : (
            `${participants.length} participant${participants.length > 1 ? 's' : ''} added`
          )}
        </Typography>

        <Dialog
          open={openParticipantsDialog}
          onClose={handleCloseParticipantsDialog}
          maxWidth="md"
          fullWidth
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Manage Participants</Typography>
            <ParticipantsForm participants={participants} setParticipants={(newValue) => handleChange("participants", newValue)} teams={formData.teams} />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseParticipantsDialog} variant="contained">Done</Button>
            </Box>
          </Box>
        </Dialog>
      </Paper>

      {/* Sport-specific form */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Manage Match</Typography>
        {renderSportSpecificForm()}
      </Box>
    </Box>
  );
};
