import { styled, Box, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

const Section = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(4),
}));

// Tech Activity View
export const TechView = ({ activity }) => {
    return (
      <Box>
        <Section>
          <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
            Activity Details
          </Typography>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="body1">
              Immerse yourself in this tech-focused activity featuring innovative challenges and learning experiences.
            </Typography>
          </Paper>
        </Section>
        
        {/* For tech activities like coding or hackathons */}
        <Section>
          <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
            Participants
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>USN</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activity.participants?.map((participant, idx) => (
                  <TableRow key={participant.usn || idx}>
                    <TableCell>{participant.name}</TableCell>
                    <TableCell>{participant.usn.toUpperCase()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Section>
      </Box>
    );
  };
  