import { Gender } from "@common/constants";
import { 
  Box, Typography, Paper, Avatar, Chip, styled, Dialog, DialogContent,
  Fade, Zoom, useTheme, useMediaQuery, IconButton, alpha, Skeleton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { PollingForm } from "./CulturalsView/PollingForm";
import { useState } from "react";
import { CulturalActivity } from "@common/models";
import { motion } from "framer-motion";

const Section = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const JudgeCard = styled(motion.div)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
  overflow: "hidden",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 28px rgba(0, 0, 0, 0.15)",
    "&::before": {
      opacity: 1,
    },
  },
}));

const JudgeAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  margin: "0 auto 12px",
  border: `4px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
  transition: "all 0.3s ease",
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(4),
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.grey[50], 0.9)} 100%)`,
  overflowX: "hidden",
}));

// Cultural Activity View
export const CulturalsView = ({
  eventId,
  activity,
}: {
  eventId: string;
  activity: CulturalActivity;
}) => {
  const [selectedJudge, setSelectedJudge] = useState(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleOpenDialog = (judge) => {
    setLoading(true);
    setSelectedJudge(judge);
    // Simulate loading the judge's full profile
    setTimeout(() => setLoading(false), 500);
  };

  const handleCloseDialog = () => {
    setSelectedJudge(null);
  };

  const isEmptyJudges = !activity.judges || activity.judges.length === 0;

  return (
    <Box>
      {/* Judges Section */}
      <Section>
        <Typography 
          variant="h5" 
          component="h2" 
          fontWeight="bold"
          sx={{ 
            mb: 3,
            position: "relative",
            display: "inline-block",
            "&:after": {
              content: '""',
              position: "absolute",
              width: "60%",
              height: "4px",
              bottom: "-8px",
              left: 0,
              backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, transparent)`,
              borderRadius: "2px"
            }
          }}
        >
          Judges
        </Typography>

        {isEmptyJudges ? (
          <Box 
            sx={{ 
              textAlign: "center", 
              py: 6, 
              px: 2, 
              background: alpha(theme.palette.background.paper, 0.6),
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle1" color="text.secondary" fontStyle="italic">
              Judges will be announced soon
            </Typography>
          </Box>
        ) : (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(auto-fill, minmax(140px, 1fr))",
                sm: "repeat(auto-fill, minmax(150px, 1fr))",
                md: "repeat(auto-fill, minmax(170px, 1fr))",
              },
              gap: { xs: 2, sm: 3 },
              position: "relative",
            }}
          >
            {activity.judges.map((judge, idx) => (
              <JudgeCard
                key={judge.id || idx}
                onClick={() => handleOpenDialog(judge)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div>
                  <Box 
                    sx={{ 
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.1)} 0%, transparent 70%)`,
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    },
                    "&:hover::before": {
                      opacity: 1,
                    }
                  }}
                >
                  <JudgeAvatar
                    alt={judge.name}
                    src={`https://eu.ui-avatars.com/api/?name=${encodeURIComponent(
                      judge.name || "Judge"
                    )}&size=160&background=random&color=fff`}
                  />
                </Box>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600,
                    mb: 0.5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {judge.name || "Guest Judge"}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: "text.secondary",
                    display: "block",
                  }}
                >
                  View Profile
                </Typography>
                </motion.div>
              </JudgeCard>
            ))}
          </Box>
        )}

        {/* Judge Profile Dialog */}
        <Dialog
          open={selectedJudge !== null}
          onClose={handleCloseDialog}
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 500 }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            elevation: 24,
            sx: {
              borderRadius: 3,
              overflow: "hidden",
            }
          }}
          fullScreen={isMobile}
        >
          {selectedJudge && (
            <>
              <Box 
                sx={{ 
                  display: "flex", 
                  justifyContent: "flex-end",
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                }}
              >
                <IconButton 
                  onClick={handleCloseDialog}
                  sx={{ 
                    bgcolor: "rgba(255,255,255,0.8)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              
              <StyledDialogContent>
                <Box 
                  sx={{
                    textAlign: "center",
                    position: "relative",
                    mb: 4,
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.15)} 0%, transparent 70%)`,
                      width: 240,
                      height: 240,
                      left: "50%",
                      top: 0,
                      transform: "translateX(-50%)",
                      borderRadius: "50%",
                      zIndex: 0
                    }
                  }}
                >
                  <Zoom in={!loading} style={{ transitionDelay: loading ? '250ms' : '0ms' }}>
                    <Avatar
                      sx={{
                        width: 160,
                        height: 160,
                        mx: "auto",
                        mb: 2,
                        border: `6px solid ${alpha(theme.palette.background.paper, 0.9)}`,
                        boxShadow: `0 16px 40px ${alpha(theme.palette.common.black, 0.2)}`,
                        position: "relative",
                        zIndex: 1
                      }}
                      alt={selectedJudge.name}
                      src={`https://eu.ui-avatars.com/api/?name=${encodeURIComponent(
                        selectedJudge.name || "Judge"
                      )}&size=320&background=random&color=fff`}
                    />
                  </Zoom>
                  
                  {loading ? (
                    <Skeleton variant="text" width="60%" sx={{ mx: "auto", height: 40 }} />
                  ) : (
                    <Fade in={!loading} timeout={500}>
                      <Typography 
                        variant="h4" 
                        component="h3" 
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        {selectedJudge.name || "Guest Judge"}
                      </Typography>
                    </Fade>
                  )}
                  
                  {loading ? (
                    <Skeleton variant="text" width="80%" sx={{ mx: "auto" }} />
                  ) : selectedJudge.description ? (
                    <Fade in={!loading} timeout={700}>
                      <Typography 
                        variant="subtitle1" 
                        color="text.secondary"
                        sx={{ 
                          fontStyle: "italic", 
                          maxWidth: "600px",
                          mx: "auto",
                          mb: 3
                        }}
                      >
                        "{selectedJudge.description}"
                      </Typography>
                    </Fade>
                  ) : null}
                </Box>
                
                {selectedJudge.portfolio && (
                  <Box sx={{ position: "relative" }}>
                    {loading ? (
                      <Box sx={{ pt: 2 }}>
                        <Skeleton variant="rectangular" height={100} />
                        <Skeleton variant="text" sx={{ mt: 1 }} />
                        <Skeleton variant="text" />
                      </Box>
                    ) : (
                      <Fade in={!loading} timeout={900}>
                        <Paper
                          elevation={0}
                          sx={{
                            mt: 3,
                            p: { xs: 2, sm: 3 },
                            bgcolor: alpha(theme.palette.background.paper, 0.7),
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            "& img": {
                              maxWidth: "100%",
                              height: "auto",
                              borderRadius: "4px",
                              boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                            },
                            "& a": {
                              color: theme.palette.primary.main,
                              textDecoration: "none",
                              fontWeight: 500,
                              "&:hover": {
                                textDecoration: "underline",
                              },
                            },
                            maxHeight: isMobile ? "calc(60vh - 200px)" : 400,
                            overflowY: "auto",
                          }}
                          dangerouslySetInnerHTML={{ __html: selectedJudge.portfolio }}
                        />
                      </Fade>
                    )}
                  </Box>
                )}
              </StyledDialogContent>
            </>
          )}
        </Dialog>
      </Section>

      {/* Poll Section */}
      <Section>
        {activity.showPoll && (
          <PollingForm eventId={eventId} activityId={activity.id} activity={activity} />
        )}
      </Section>

      {/* Performers Section */}
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
