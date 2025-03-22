import { Gender } from "@common/constants";
import { Box, Typography, Paper, Avatar, Chip, styled } from "@mui/material";
import { PollingForm } from "./CulturalsView/PollingForm";

const Section = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

// Cultural Activity View
export const CulturalsView = ({ eventId, activity }) => {
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

      {/* Poll Section */}
      <Section>
        {activity.showPoll && (
          <PollingForm eventId={eventId} activityId={activity.activityId} activity={activity} />
        )}
      </Section>

      <Section>
        <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
          Performers
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 2,
          }}
        >
          {activity.participants?.map((participant, idx) => (
            <Paper
              key={participant.usn || idx}
              sx={{
                p: 2,
                borderRadius: 1,
                textAlign: "center",
              }}
            >
              <Avatar
                sx={{
                  width: 70,
                  height: 70,
                  mb: 1,
                  mx: "auto",
                }}
                alt={participant.name}
                src={`https://eu.ui-avatars.com/api/?name=${encodeURIComponent(
                  participant.name
                )}&size=70`}
              />
              <Typography variant="subtitle1" noWrap>
                {participant.name}
              </Typography>
              <Chip
                size="small"
                label={
                  participant.gender === Gender.MALE
                    ? "Male"
                    : participant.gender === Gender.FEMALE
                      ? "Female"
                      : "Other"
                }
                sx={{ mt: 1 }}
              />
            </Paper>
          ))}
        </Box>
      </Section>
    </Box>
  );
};