import { useState, useCallback, memo } from 'react';
import { Box, Button, Dialog, Typography, Paper } from '@mui/material';
import { TeamsForm } from './SportsView/TeamsForm';
import { ParticipantsForm } from './ParticipantsForm';
import { CricketForm } from './SportsView/Cricket';
import { GenericSport } from './SportsView/GenericSport';
import { SportsActivity } from '@common/models';
import { Cricket, OtherSport, Sport } from '@common/models/sports/SportsActivity';
import { EventType } from '@common/constants';

// Define types properly
interface SportsViewProps {
  formData: SportsActivity<Sport>;
  setFormData: (data: SportsActivity<Sport>) => void;
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

export const SportsView = ({ formData, setFormData }: SportsViewProps) => {
  const [openTeamsDialog, setOpenTeamsDialog] = useState(false);
  const [openParticipantsDialog, setOpenParticipantsDialog] = useState(false);

  const teams = formData.teams || [];

  // Update form data with parsed activity
  const handleChange = (field: keyof SportsActivity<Sport>, value: any) => {
    setFormData(SportsActivity.parse({...formData, [field]: value}));
  };

  // Render sport-specific form based on selected sport type
  const renderSportSpecificForm = useCallback(() => {
    switch (formData.eventType) {
      case EventType.CRICKET:
        return <CricketForm formData={formData as SportsActivity<Cricket>} setFormData={setFormData} />;
      case EventType.FOOTBALL:
        return <GenericSport formData={formData as SportsActivity<OtherSport>} setFormData={setFormData} />;
      default:
        return <GenericSport formData={formData} setFormData={setFormData} />;
    }
  }, [formData, setFormData]);

  return (
    <Box>
      {/* Teams Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Teams</Typography>
          <Button
            variant="contained"
            onClick={() => setOpenTeamsDialog(true)}
            size="small"
          >
            Manage Teams
          </Button>
        </Box>

        <SummarySection label="team" count={teams.length} />

        <Dialog
          open={openTeamsDialog}
          onClose={() => setOpenTeamsDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent title="Manage Teams" onClose={() => setOpenTeamsDialog(false)}>
            <TeamsForm
              teams={teams}
              setTeams={useCallback((newTeams) => handleChange('teams', newTeams), [handleChange])}
            />
          </DialogContent>
        </Dialog>
      </Paper>

      {/* Participants Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Participants</Typography>
          <Button
            variant="contained"
            onClick={() => setOpenParticipantsDialog(true)}
            disabled={teams.length === 0}
            size="small"
          >
            Manage Participants
          </Button>
        </Box>

        <SummarySection label="participant" count={formData.participants.length} />

        <Dialog
          open={openParticipantsDialog}
          onClose={() => setOpenParticipantsDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent title="Manage Participants" onClose={() => setOpenParticipantsDialog(false)}>
            <ParticipantsForm
              participants={formData.participants || []}
              setParticipants={useCallback((newParticipants) => handleChange("participants", newParticipants), [handleChange])}
              teams={teams}
            />
          </DialogContent>
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