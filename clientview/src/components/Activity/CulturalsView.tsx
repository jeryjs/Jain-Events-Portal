import { CulturalActivity, Judge } from "@common/models";
import CloseIcon from "@mui/icons-material/Close";
import {
  Avatar,
  Box,
  Chip,
  Dialog, DialogContent,
  Fade,
  IconButton,
  Paper,
  Skeleton,
  Typography,
  Zoom,
  alpha,
  styled,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { PollingForm } from "./CulturalsView/PollingForm";

const Section = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const JudgeCard = styled(motion.div)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`
    : `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
  overflow: "hidden",
  position: "relative",
  border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.2 : 0.05)}`,
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
    boxShadow: theme.palette.mode === 'dark'
      ? `0 12px 28px ${alpha(theme.palette.common.black, 0.4)}`
      : `0 12px 28px ${alpha(theme.palette.common.black, 0.15)}`,
    "&::before": {
      opacity: 1,
    },
  },
}));

const JudgeAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  margin: "0 auto 12px",
  border: `4px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)}`,
  boxShadow: theme.palette.mode === 'dark'
    ? `0 8px 20px ${alpha(theme.palette.common.black, 0.25)}`
    : `0 8px 20px ${alpha(theme.palette.common.black, 0.12)}`,
  transition: "all 0.3s ease",
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(4),
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`
    : `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.grey[50], 0.9)} 100%)`,
  overflowX: "hidden",
}));

const StyledCard = styled(motion.div)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
  background: theme.palette.mode === "dark"
    ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`
    : `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
  overflow: "hidden",
  position: "relative",
  border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === "dark" ? 0.2 : 0.05)}`,
  boxShadow: theme.shadows[3],
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[6],
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  margin: "0 auto 12px",
  border: `4px solid ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.2 : 0.1)}`,
  boxShadow: theme.palette.mode === "dark"
    ? `0 8px 20px ${alpha(theme.palette.common.black, 0.25)}`
    : `0 8px 20px ${alpha(theme.palette.common.black, 0.12)}`,
  transition: "all 0.3s ease",
}));

// Performers styled components
const PerformerSection = styled(motion.section)(({ theme }) => ({
  marginTop: theme.spacing(6),
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    background: theme.palette.mode === "dark"
      ? `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0)} 0%, ${alpha(theme.palette.primary.dark, 0.05)} 50%, ${alpha(theme.palette.background.default, 0)} 100%)`
      : `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0)} 0%, ${alpha(theme.palette.primary.light, 0.06)} 50%, ${alpha(theme.palette.background.default, 0)} 100%)`,
    zIndex: -1,
    borderRadius: theme.spacing(3),
  }
}));

const PerformerCard = styled(motion.div)(({ theme }) => ({
  padding: theme.spacing(2, 3.5),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(3),
  backgroundColor: theme.palette.mode === "dark"
    ? alpha(theme.palette.background.paper, 0.6)
    : theme.palette.background.paper,
  border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === "dark" ? 0.2 : 0.08)}`,
  boxShadow: theme.palette.mode === "dark"
    ? `0 8px 32px ${alpha(theme.palette.common.black, 0.25)}`
    : `0 8px 32px ${alpha(theme.palette.common.black, 0.05)}`,
  transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
  overflow: "hidden",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "4px",
    background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0.7,
    transition: "opacity 0.3s ease",
  },
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.palette.mode === "dark"
      ? `0 14px 40px ${alpha(theme.palette.common.black, 0.35)}`
      : `0 14px 40px ${alpha(theme.palette.common.black, 0.12)}`,
    "&::before": {
      opacity: 1,
    },
  },
}));

const TeamCard = styled(motion.div)(({ theme }) => ({
  padding: theme.spacing(2.5, 3.5),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(3),
  backgroundColor: theme.palette.mode === "dark"
    ? alpha(theme.palette.background.paper, 0.7)
    : alpha(theme.palette.background.paper, 0.95),
  border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === "dark" ? 0.2 : 0.08)}`,
  boxShadow: theme.palette.mode === "dark"
    ? `0 10px 40px ${alpha(theme.palette.common.black, 0.3)}`
    : `0 10px 40px ${alpha(theme.palette.common.black, 0.08)}`,
  transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
  cursor: "pointer",
  overflow: "hidden",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "6px",
    background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0.6,
    transition: "opacity 0.3s ease, width 0.3s ease",
  },
  "&:hover": {
    transform: "translateY(-5px) scale(1.02)",
    boxShadow: theme.palette.mode === "dark"
      ? `0 20px 60px ${alpha(theme.palette.common.black, 0.4)}`
      : `0 20px 60px ${alpha(theme.palette.common.black, 0.15)}`,
    "&::before": {
      opacity: 1,
      width: "8px",
    },
  },
}));

const PerformerAvatar = styled(Avatar)(({ theme }) => ({
  width: 65,
  height: 65,
  border: `3px solid ${alpha(theme.palette.background.paper, 0.9)}`,
  boxShadow: theme.palette.mode === "dark"
    ? `0 4px 14px ${alpha(theme.palette.common.black, 0.3)}`
    : `0 4px 14px ${alpha(theme.palette.common.black, 0.1)}`,
  transition: "all 0.3s ease",
}));

const TeamAvatar = styled(Box)(({ theme }) => ({
  width: 70,
  height: 70,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.palette.mode === "dark"
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.8)}, ${alpha(theme.palette.secondary.dark, 0.8)})`
    : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.8)}, ${alpha(theme.palette.secondary.light, 0.8)})`,
  boxShadow: theme.palette.mode === "dark"
    ? `0 8px 20px ${alpha(theme.palette.common.black, 0.3)}`
    : `0 8px 20px ${alpha(theme.palette.common.black, 0.1)}`,
}));

const PerformerInfo = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: "hidden",
}));

// Performers styled components
const PerformerDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(4),
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`
    : `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.grey[50], 0.9)} 100%)`,
  overflowX: "hidden",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    background: theme.palette.mode === 'dark'
      ? `radial-gradient(circle at top right, ${alpha(theme.palette.primary.dark, 0.15)}, transparent 70%)`
      : `radial-gradient(circle at top right, ${alpha(theme.palette.primary.light, 0.15)}, transparent 70%)`,
    zIndex: 0,
    pointerEvents: "none",
  },
}));

// Updated Winners styled components - convert to list view style
const WinnerSection = styled(Box)(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(0.5),
  marginBottom: theme.spacing(3),
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    background: theme.palette.mode === "dark"
      ? `radial-gradient(ellipse at top, ${alpha(theme.palette.warning.dark, 0.1)}, transparent 80%)`
      : `radial-gradient(ellipse at top, ${alpha(theme.palette.warning.light, 0.1)}, transparent 80%)`,
    zIndex: -1,
    pointerEvents: "none",
    borderRadius: theme.spacing(2),
  }
}));

const WinnerCard = styled(motion.div)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  background: theme.palette.mode === "dark"
    ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`
    : `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
  overflow: "hidden",
  position: "relative",
  border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === "dark" ? 0.1 : 0.05)}`,
  boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  "&:last-child": {
    marginBottom: 0,
  },
}));

const WinnerAvatarContainer = styled(motion.div)(({ theme }) => ({
  position: "relative",
  marginRight: theme.spacing(2),
}));

const WinnerCrown = styled(Box)<{ show: boolean }>(({ show }) => ({
  position: "absolute",
  top: -16,
  left: "50%",
  transform: "translateX(-50%)",
  width: 32,
  height: 32,
  backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBmaWxsPSIjZmZjMTA3Ij48cGF0aCBkPSJNMjU2IDIyLjcxNkwyMDguNjUgMTkwLjgxYy0xLjA1MiAzLjc0OS0zLjk5IDYuNTc0LTcuNzcyIDcuNDhsLTE3OC45IDQyLjk2OCA3NS41MjUgMTI5LjQ0YzEuOTI1IDMuMjk3IDEuOTI1IDcuMzgxIDAgMTAuNjc5bC0yNC41NDUgNDIuMDM1aDM2Ni4wOWwtMjQuNTQ1LTQyLjAzNWMtMS45MjUtMy4yOTctMS45MjUtNy4zODEgMC0xMC42NzlMNDkwLjAyIDI0MS4yNiAzMTEuMTIyIDE5OC4yOWMtMy43ODItLjkwNi02LjcyLTMuNzMxLTcuNzcyLTcuNDhMMjU2IDIyLjcxNnoiLz48cGF0aCBmaWxsPSIjZmZkYjRkIiBkPSJNMjU2IDIyLjcxNkwyMDguNjUgMTkwLjgxYy0xLjA1MiAzLjc0OS0zLjk5IDYuNTc0LTcuNzcyIDcuNDhsLTE3OC45IDQyLjk2OCA3NS41MjUgMTI5LjQ0YzEuOTI1IDMuMjk3IDEuOTI1IDcuMzgxIDAgMTAuNjc5bC0yNC41NDUgNDIuMDM1aDM2Ni4wOWwtMjQuNTQ1LTQyLjAzNWMtMS45MjUtMy4yOTctMS45MjUtNy4zODEgMC0xMC42NzlMNDkwLjAyIDI0MS4yNiAzMTEuMTIyIDE5OC4yOWMtMy43ODItLjkwNi02LjcyLTMuNzMxLTcuNzcyLTcuNDhMMjU2IDIyLjcxNnoiLz48L3N2Zz4=')",
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
  opacity: show ? 1 : 0,
  transition: "transform 0.3s ease, opacity 0.3s ease",
  zIndex: 5,
  filter: "drop-shadow(0px 3px 4px rgba(0,0,0,0.2))",
}));

const WinnerAvatar = styled(Avatar)<{ position: string }>(({ position }) => ({
  width: position === "winner" ? 70 : 60,
  height: position === "winner" ? 70 : 60,
  margin: "0 auto",
  border: position === "winner"
    ? `3px solid ${alpha('#FFD700', 0.9)}`
    : `3px solid ${alpha('#C0C0C0', 0.9)}`,
  boxShadow: position === "winner"
    ? `0 6px 15px ${alpha('#FFA500', 0.35)}`
    : `0 5px 15px ${alpha('#A9A9A9', 0.35)}`,
  transition: "all 0.3s ease",
}));

const WinnerTeamBadge = styled(Box)<{ placed: string }>(({ theme, placed }) => ({
  width: placed === "winner" ? 70 : 60,
  height: placed === "winner" ? 70 : 60,
  margin: "0 auto",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: placed === "winner"
    ? `linear-gradient(135deg, ${alpha('#FFD700', 0.9)}, ${alpha('#FFA500', 0.9)})`
    : `linear-gradient(135deg, ${alpha('#C0C0C0', 0.9)}, ${alpha('#A9A9A9', 0.9)})`,
  boxShadow: placed === "winner"
    ? `0 6px 15px ${alpha(theme.palette.warning.main, 0.4)}, inset 0 -3px 6px ${alpha(theme.palette.common.black, 0.15)}, inset 0 3px 6px ${alpha(theme.palette.common.white, 0.15)}`
    : `0 5px 15px ${alpha(theme.palette.common.black, 0.2)}, inset 0 -3px 6px ${alpha(theme.palette.common.black, 0.1)}, inset 0 3px 6px ${alpha(theme.palette.common.white, 0.1)}`,
  border: placed === "winner"
    ? `2px solid ${alpha('#FFD700', 0.9)}`
    : `2px solid ${alpha('#C0C0C0', 0.9)}`,
  position: "relative",
  "&::after": placed === "winner" ? {
    content: '""',
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    background: `radial-gradient(circle at 30% 30%, ${alpha(theme.palette.common.white, 0.3)}, transparent 50%)`,
    zIndex: 1,
  } : {},
}));

const WinnerPosition = styled(Box)<{ placed: string }>(({ theme, placed }) => ({
  position: "absolute",
  top: 0,
  right: 0,
  background: placed === "winner"
    ? `linear-gradient(45deg, ${alpha('#FFD700', 0.9)}, ${alpha('#FFA500', 0.9)})`
    : `linear-gradient(45deg, ${alpha('#C0C0C0', 0.9)}, ${alpha('#A9A9A9', 0.9)})`,
  color: placed === "winner" ? "#000" : "#fff",
  padding: theme.spacing(0.3, 1),
  borderRadius: `0 ${theme.shape.borderRadius}px 0 ${theme.shape.borderRadius}px`,
  fontSize: "0.7rem",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  zIndex: 2,
  boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.15)}`,
}));

const CompactChip = styled(Chip)(({ theme, color }) => ({
  height: 24,
  fontSize: '0.7rem',
  fontWeight: 'bold',
  "& .MuiChip-label": {
    padding: theme.spacing(0, 1),
  }
}));

// New styled component for audience choice badge
const AudienceChoiceBadge = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.secondary.main, 0.15),
  color: theme.palette.secondary.main,
  fontWeight: 'bold',
  marginLeft: theme.spacing(1),
  height: 24,
  fontSize: '0.7rem',
  "& .MuiChip-label": {
    padding: theme.spacing(0, 1),
  }
}));

// Cultural Activity View
export const CulturalsView = ({
  eventId,
  activity,
}: {
  eventId: string;
  activity: CulturalActivity;
}) => {
  const [selectedJudge, setSelectedJudge] = useState<Judge>(null);
  const [selectedTeam, setSelectedTeam] = useState<{ id: string, name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDarkMode = theme.palette.mode === 'dark';

  // Determine if the winner and audience choice are the same
  const winner = activity.winners?.find(w => w.rank === 1)?.teamId;
  const audienceChoice = activity.audienceChoice?.teamId;
  const isAudienceChoiceSameAsWinner = winner && audienceChoice && winner === audienceChoice;

  const handleOpenDialog = (judge: Judge) => {
    setLoading(true);
    setSelectedJudge(judge);
    // Simulate loading the judge's full profile
    setTimeout(() => setLoading(false), 500);
  };

  const handleCloseDialog = () => {
    setSelectedJudge(null);
  };

  const hasJudges = activity.judges && activity.judges.length > 0;
  const isEmptyJudges = !hasJudges;

  const handleCloseTeam = () => {
    setSelectedTeam(null);
  };

  const handleTeamClick = (team: { id: string, name: string }) => {
    setSelectedTeam(team);
  };
  
  return (
    <Box>
      {/* Judges Section - Only render if judges data exists */}
      {hasJudges && (
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
                background: alpha(theme.palette.background.paper, isDarkMode ? 0.4 : 0.6),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.1 : 0.05)}`,
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
                        src={judge.profilePic}
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
                bgcolor: theme.palette.background.paper,
                border: isDarkMode ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
                margin: isMobile ? 2 : 'auto',
                maxHeight: isMobile ? 'calc(100% - 32px)' : '90vh',
                width: isMobile ? 'calc(100% - 32px)' : '100%',
              }
            }}
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
                      bgcolor: isDarkMode
                        ? alpha(theme.palette.background.paper, 0.7)
                        : "rgba(255,255,255,0.8)",
                      "&:hover": {
                        bgcolor: isDarkMode
                          ? alpha(theme.palette.background.paper, 0.9)
                          : "rgba(255,255,255,0.95)"
                      },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>

                <StyledDialogContent sx={{
                  pt: { xs: 5, sm: 4 },
                  px: { xs: 2, sm: 4 },
                  pb: { xs: 3, sm: 4 }
                }}>
                  <Box
                    sx={{
                      textAlign: "center",
                      position: "relative",
                      mb: 4,
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, isDarkMode ? 0.1 : 0.15)} 0%, transparent 70%)`,
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
                          width: isMobile ? 120 : 160,
                          height: isMobile ? 120 : 160,
                          mx: "auto",
                          mb: 2,
                          border: `6px solid ${alpha(theme.palette.background.paper, 0.9)}`,
                          boxShadow: `0 16px 40px ${alpha(theme.palette.common.black, 0.2)}`,
                          position: "relative",
                          zIndex: 1
                        }}
                        alt={selectedJudge.name}
                        src={selectedJudge.profilePic}
                      />
                    </Zoom>

                    {loading ? (
                      <Skeleton variant="text" width="60%" sx={{ mx: "auto", height: 40 }} />
                    ) : (
                      <Fade in={!loading} timeout={500}>
                        <Typography
                          variant={isMobile ? "h5" : "h4"}
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
                            mb: 3,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            lineHeight: 1.5
                          }}
                        >
                          "{selectedJudge.description}"
                        </Typography>
                      </Fade>
                    ) : null}
                  </Box>

                  {/* Portfolio/HTML Content Section */}
                  <Box sx={{ position: "relative" }}>
                    {loading ? (
                      <Box sx={{ pt: 2 }}>
                        <Skeleton variant="rectangular" height={100} />
                        <Skeleton variant="text" sx={{ mt: 1 }} />
                        <Skeleton variant="text" />
                      </Box>
                    ) : (
                      <Fade in={!loading && !!selectedJudge.portfolio} timeout={900}>
                        <Paper
                          elevation={0}
                          sx={{
                            mt: 1,
                            p: { xs: 2, sm: 3 },
                            bgcolor: isDarkMode
                              ? alpha(theme.palette.background.default, 0.4)
                              : alpha(theme.palette.background.paper, 0.7),
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.2 : 0.5)}`,
                            "& img": {
                              maxWidth: "100%",
                              height: "auto",
                              borderRadius: "4px",
                              boxShadow: isDarkMode
                                ? `0 2px 12px ${alpha(theme.palette.common.black, 0.3)}`
                                : `0 2px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                            },
                            "& a": {
                              color: theme.palette.primary.main,
                              textDecoration: "none",
                              fontWeight: 500,
                              "&:hover": {
                                textDecoration: "underline",
                              },
                            },
                            minHeight: 100,
                            maxHeight: isMobile ? "calc(50vh - 180px)" : 500,
                            overflowY: "auto",
                          }}
                          dangerouslySetInnerHTML={{ __html: selectedJudge.portfolio }}
                        />
                      </Fade>
                    )}
                  </Box>
                </StyledDialogContent>
              </>
            )}
          </Dialog>
        </Section>
      )}

      {/* Winners Section */}
      {activity.winners && activity.winners.length > 0 && (
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
            Winners
          </Typography>

          <WinnerSection>
            <Box
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {activity.winners
                .sort((a, b) => a.rank - b.rank) // Sort by rank
                .slice(0, 2) // Only show winner and runner-up
                .map((winner, idx) => {
                  const position = idx === 0 ? "winner" : "runnerup";

                  // Get team or participant info based on teamId
                  const team = activity.teams?.find(t => t.id.trim() === winner.teamId.trim());
                  const participants = activity.getTeamParticipants(winner.teamId);
                  const participant = participants?.length > 0 ? participants[0] : null;

                  const isTeam = team && participants?.length > 1;
                  const displayName = isTeam ? team.name : (participant?.name || "Unknown Participant");

                  const positionLabels = {
                    "winner": "Winner",
                    "runnerup": "Runner Up"
                  };

                  // Check if this winner is also the audience choice
                  const isAudienceChoice = idx === 0 && isAudienceChoiceSameAsWinner;
                  
                  return (
                    <WinnerCard
                      key={winner.teamId || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: idx * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{
                        y: -5,
                        boxShadow: theme.shadows[position === "winner" ? 8 : 5],
                        transition: { duration: 0.2 }
                      }}
                    >
                      <WinnerPosition placed={position}>
                        {idx === 0 ? "1st" : "2nd"}
                      </WinnerPosition>

                      <WinnerAvatarContainer
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <WinnerCrown show={position === "winner"} />

                        {isTeam ? (
                          <WinnerTeamBadge placed={position}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                color: "#fff",
                                textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                                position: "relative",
                                zIndex: 2,
                              }}
                            >
                              {team.name.substring(0, 2).toUpperCase()}
                            </Typography>
                          </WinnerTeamBadge>
                        ) : (
                          <WinnerAvatar
                            alt={participant?.name || "Winner"}
                            src={participant?.profilePic}
                            position={position}
                          />
                        )}
                      </WinnerAvatarContainer>

                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: '0.95rem', sm: '1rem' },
                            color: position === "winner"
                              ? theme.palette.mode === "dark" ? alpha('#FFD700', 0.9) : theme.palette.warning.dark
                              : theme.palette.text.primary,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {displayName}
                          {isAudienceChoice && (
                            <AudienceChoiceBadge 
                              label="Audience Choice" 
                              size="small"
                            />
                          )}
                        </Typography>

                        {participant?.college && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: '0.7rem',
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {participant.college}
                          </Typography>
                        )}
                      </Box>

                      <CompactChip
                        label={positionLabels[position]}
                        color={position === "winner" ? "warning" : "default"}
                        sx={{
                          bgcolor: position === "winner"
                            ? theme.palette.mode === 'dark' ? alpha('#FFD700', 0.2) : alpha('#FFD700', 0.7)
                            : theme.palette.mode === 'dark' ? alpha('#C0C0C0', 0.2) : alpha('#C0C0C0', 0.7),
                          color: position === "winner"
                            ? theme.palette.mode === 'dark' ? alpha('#FFD700', 0.9) : "rgba(0,0,0,0.8)"
                            : theme.palette.text.primary,
                        }}
                      />
                    </WinnerCard>
                  );
                })}

              {/* Audience Choice Card - only show if different from winner */}
              {audienceChoice && !isAudienceChoiceSameAsWinner && (
                <WinnerCard
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 0.3,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -5, 
                    boxShadow: theme.shadows[6],
                    transition: { duration: 0.2 }
                  }}
                  sx={{
                    borderLeft: `5px solid ${theme.palette.secondary.main}`,
                    background: `linear-gradient(to right, ${alpha(theme.palette.secondary.light, 0.1)}, transparent 50%)`,
                  }}
                >
                  <WinnerPosition placed="audience">
                    Choice
                  </WinnerPosition>
                  
                  <WinnerAvatarContainer
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    {(() => {
                      // Get team or participant info for audience choice
                      const team = activity.teams?.find(t => t.id === audienceChoice);
                      const participants = activity.getTeamParticipants(audienceChoice);
                      const participant = participants?.length > 0 ? participants[0] : null;
                      const isTeam = team && participants?.length > 1;
                      
                      return isTeam ? (
                        <WinnerTeamBadge placed="audience">
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: "bold",
                              color: "#fff",
                              textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                              position: "relative",
                              zIndex: 2,
                            }}
                          >
                            {team.name.substring(0, 2).toUpperCase()}
                          </Typography>
                        </WinnerTeamBadge>
                      ) : (
                        <WinnerAvatar
                          alt={participant?.name || "Audience Choice"}
                          src={participant?.profilePic}
                          position="audience"
                        />
                      );
                    })()}
                  </WinnerAvatarContainer>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                        color: theme.palette.secondary.main,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {activity.audienceChoice.name}
                    </Typography>
                    
                    {(() => {
                      // Show college if it's a participant
                      const participants = activity.getTeamParticipants(audienceChoice);
                      const participant = participants?.length > 0 ? participants[0] : null;
                      
                      return participant?.college ? (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{
                            fontSize: '0.7rem',
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {participant.college}
                        </Typography>
                      ) : null;
                    })()}
                  </Box>
                  
                  <CompactChip 
                    label="Audience Choice" 
                    color="secondary"
                    sx={{ 
                      bgcolor: theme.palette.mode === 'dark' 
                        ? alpha(theme.palette.secondary.main, 0.2) 
                        : alpha(theme.palette.secondary.light, 0.4),
                      color: theme.palette.secondary.main
                    }} 
                  />
                </WinnerCard>
              )}
            </Box>
          </WinnerSection>
        </Section>
      )}

      {/* Poll Section */}
      <Section>
        {activity.showPoll && (
          <PollingForm eventId={eventId} activityId={activity.id} activity={activity} />
        )}
      </Section>

      {/* Performers Section with Column Layout */}
      <PerformerSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography
          variant="h5"
          component="h2"
          fontWeight="bold"
          sx={{
            mb: 4,
            position: "relative",
            display: "inline-block",
            "&::after": {
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
          Performers
        </Typography>

        {(!activity.participants || activity.participants.length === 0) ? (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              px: 2,
              background: alpha(theme.palette.background.paper, isDarkMode ? 0.4 : 0.6),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.1 : 0.05)}`,
            }}
          >
            <Typography variant="subtitle1" color="text.secondary" fontStyle="italic">
              Performers will be announced soon
            </Typography>
          </Box>
        ) : (
          <Box sx={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "100%",
          }}>
            {/* Teams section - only display if there are teams */}
            {activity.teams && activity.teams.length > 0 ? (
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    color: theme.palette.mode === "dark"
                      ? alpha(theme.palette.primary.light, 0.9)
                      : theme.palette.primary.main,
                    fontWeight: 600,
                  }}
                >
                  Teams
                </Typography>

                {activity.teams.map((team, idx) => (
                  <TeamCard
                    key={team.id || idx}
                    onClick={() => handleTeamClick(team)}
                    whileHover={{ x: 5 }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: idx * 0.1,
                      type: "spring",
                      stiffness: 100,
                    }}
                  >
                    <TeamAvatar>
                      <Avatar
                        sx={{
                          fontSize: 24,
                          fontWeight: 'bold',
                          backgroundColor: "transparent",
                        }}
                      >
                        {team.name.trim().split(" ").length === 1
                          ? team.name.substring(0, 2).toUpperCase()
                          : team.name
                            .split(" ")
                            .map((word) => word.charAt(0))
                            .join("")
                            .toUpperCase()}
                      </Avatar>
                    </TeamAvatar>

                    <PerformerInfo>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 0.5,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {team.name}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        Click to view team members and details
                      </Typography>
                    </PerformerInfo>
                  </TeamCard>
                ))}
              </Box>
            ) : (
              /* Individual performers - only show if there are no teams */
              <Box>
                {activity.participants.map((participant, idx) => (
                  <PerformerCard
                    key={participant.usn || idx}
                    // onClick={() => handlePerformerClick(participant)}
                    whileHover={{ x: 5 }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: idx * 0.1,
                      type: "spring",
                      stiffness: 100,
                    }}
                    sx={{ cursor: "pointer" }}
                  >
                    <PerformerAvatar
                      alt={participant.name}
                      src={participant.profilePic}
                    />

                    <PerformerInfo>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          mb: 0.5,
                        }}
                      >
                        {participant.name}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                        }}
                      >
                        {participant.college || "Jain University"}
                      </Typography>
                    </PerformerInfo>
                  </PerformerCard>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Team Detail Dialog */}
        <AnimatePresence>
          {selectedTeam && (
            <Dialog
              open={selectedTeam !== null}
              onClose={handleCloseTeam}
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                elevation: 24,
                sx: {
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: theme.palette.background.paper,
                  border: isDarkMode ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
                  margin: isMobile ? 2 : 'auto',
                  maxHeight: isMobile ? 'calc(100% - 32px)' : '90vh',
                  width: isMobile ? 'calc(100% - 32px)' : '100%',
                }
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 10
                }}
              >
                <IconButton
                  onClick={handleCloseTeam}
                  sx={{
                    bgcolor: isDarkMode
                      ? alpha(theme.palette.background.paper, 0.7)
                      : "rgba(255,255,255,0.8)",
                    "&:hover": {
                      bgcolor: isDarkMode
                        ? alpha(theme.palette.background.paper, 0.9)
                        : "rgba(255,255,255,0.95)"
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              <PerformerDialogContent sx={{
                pt: { xs: 5, sm: 4 },
                px: { xs: 2, sm: 4 },
                pb: { xs: 3, sm: 4 }
              }}>
                <Box
                  sx={{
                    textAlign: "center",
                    position: "relative",
                    mb: 4,
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, isDarkMode ? 0.1 : 0.15)} 0%, transparent 70%)`,
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
                  <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                        boxShadow: `0 16px 40px ${alpha(theme.palette.common.black, 0.25)}`,
                        position: "relative",
                        zIndex: 1
                      }}
                    >
                      <Typography variant="h3" sx={{ color: "#fff", fontWeight: "bold" }}>
                        {selectedTeam.name.trim().split(" ").length === 1
                          ? selectedTeam.name.substring(0, 2).toUpperCase()
                          : selectedTeam.name
                            .split(" ")
                            .map((word) => word.charAt(0))
                            .join("")
                            .toUpperCase()}
                      </Typography>
                    </Box>
                  </Zoom>

                  <Fade in={true} timeout={600}>
                    <Typography
                      variant={isMobile ? "h5" : "h4"}
                      component="h3"
                      fontWeight="bold"
                      sx={{ mb: 1 }}
                    >
                      {selectedTeam.name}
                    </Typography>
                  </Fade>
                </Box>

                <Fade in={true} timeout={800}>
                  <Box sx={{ position: "relative" }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        position: "relative",
                        display: "inline-block",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          width: "50%",
                          height: "3px",
                          bottom: "-4px",
                          left: 0,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, transparent)`,
                          borderRadius: "1px"
                        }
                      }}
                    >
                      Team Members
                    </Typography>

                    <Box
                      component={motion.div}
                      sx={{ mb: 3 }}
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.1
                          }
                        }
                      }}
                    >
                      {activity.getTeamParticipants(selectedTeam.id).map((member, idx) => (
                        <motion.div
                          key={member.usn || idx}
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                          }}
                        >
                          <Paper
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              p: 2,
                              mb: 2,
                              borderRadius: 2,
                              bgcolor: isDarkMode
                                ? alpha(theme.palette.background.default, 0.4)
                                : alpha(theme.palette.background.paper, 0.7),
                              border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.2 : 0.1)}`,
                              boxShadow: isDarkMode
                                ? `0 4px 20px ${alpha(theme.palette.common.black, 0.2)}`
                                : `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                              transition: "transform 0.3s ease, box-shadow 0.3s ease",
                              "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: isDarkMode
                                  ? `0 8px 30px ${alpha(theme.palette.common.black, 0.3)}`
                                  : `0 8px 30px ${alpha(theme.palette.common.black, 0.1)}`,
                              }
                            }}
                          >
                            <Avatar
                              src={member.profilePic}
                              alt={member.name}
                              sx={{
                                mr: 2,
                                width: 60,
                                height: 60,
                                border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                              }}
                            />
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {member.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {member.usn} • {member.branch || 'Department not specified'}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  mt: 0.5,
                                  color: theme.palette.primary.main,
                                  fontWeight: 500
                                }}
                              >
                                {member.college}
                              </Typography>
                            </Box>
                          </Paper>
                        </motion.div>
                      ))}
                    </Box>
                  </Box>
                </Fade>

                <Box sx={{ flex: 1 }}></Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    textAlign: "center",
                    mt: 3,
                    display: "block",
                    opacity: 0.7
                  }}
                >
                  Team details are visible only to event organizers and administrators.
                </Typography>
              </PerformerDialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </PerformerSection>
    </Box>
  );
};
