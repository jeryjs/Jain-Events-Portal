import { Gender } from "@common/constants";
import { Box, Typography, Paper, Avatar, Chip, styled } from "@mui/material";

const Section = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(4),
}));

// Cultural Activity View
export const CulturalsView = ({ activity }) => {
  return (
    <Box>
      <Section>
        <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
          Performance Details
        </Typography>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="body1">
            {activity.performanceDetails || 
              "Experience the magic of this cultural showcase featuring talented performers across various art forms."}
          </Typography>
        </Paper>
      </Section>
      
      <Section>
        <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
          Performers
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {activity.participants?.map((participant, idx) => (
            <Paper 
              key={participant.usn || idx} 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                width: 200,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-5px)' }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar 
                  sx={{ width: 80, height: 80, mb: 2 }}
                  alt={participant.name}
                  src={`https://i.pravatar.cc/150?u=${participant.usn || idx}`}
                />
                <Typography variant="h6" align="center">{participant.name}</Typography>
                <Chip 
                  size="small" 
                  label={participant.gender === Gender.MALE ? 'Male' : 
                         participant.gender === Gender.FEMALE ? 'Female' : 'Other'} 
                  sx={{ mt: 1 }}
                />
              </Box>
            </Paper>
          ))}
        </Box>
      </Section>
    </Box>
  );
};