import { styled, Box, Typography, Paper, Chip, Avatar } from "@mui/material";

const Section = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(4),
}));

// General Activity View
export const GeneralView = ({ activity }) => {
    return (
      <Box>
        <Section>
          <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
            Activity Details
          </Typography>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="body1">
              Join us for this exciting activity featuring engaged participants and memorable experiences.
            </Typography>
          </Paper>
        </Section>
        
        <Section>
          <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
            Participants
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {activity.participants?.map((participant, idx) => (
              <Chip
                key={participant.usn || idx}
                avatar={<Avatar alt={participant.name} src={`https://i.pravatar.cc/150?u=${participant.usn || idx}`} />}
                label={participant.name}
                variant="outlined"
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
        </Section>
      </Box>
    );
  };