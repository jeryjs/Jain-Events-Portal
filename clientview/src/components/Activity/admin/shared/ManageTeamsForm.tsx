import { Participant } from "@common/models";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Card, CardContent, CardHeader, Dialog, DialogContent, Paper, Typography } from "@mui/material";
import { useState } from "react";
import { ParticipantsForm } from "./ParticipantsForm";
import { TeamsForm } from "./TeamsForm";

interface ManageTeamsFormProps {
    teams: { id: string, name: string }[];
    setTeams: (teams: { id: string, name: string }[]) => void;
    participants: Participant[];
    setParticipants: (participants: Participant[]) => void;
    isSoloPerformance: boolean;
}

const ManageTeamsForm = ({ teams, setTeams, participants, setParticipants, isSoloPerformance }: ManageTeamsFormProps) => {
    const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);
    const [isTeamsDialogOpen, setIsTeamsDialogOpen] = useState<boolean>(false);

    const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedAccordion(isExpanded ? panel : false);
    };

    const handleOpenTeamsDialog = () => {
        setIsTeamsDialogOpen(true);
    };

    const handleCloseTeamsDialog = () => {
        setIsTeamsDialogOpen(false);
    };

    return (
        <Paper elevation={1} sx={{ mb: 3 }}>
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="h6">Teams</Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1">
                            Teams Configured: {teams.length}
                        </Typography>
                        {!isSoloPerformance && (
                            <Button variant="outlined" onClick={handleOpenTeamsDialog} size="small">
                                Manage Teams
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </Card>

            {!isSoloPerformance ? (
                <Box>
                    {teams.length > 0 ? (
                        teams.map((team, index) => (
                            <Accordion
                                key={team.id || index}
                                expanded={expandedAccordion === `team-accordion-${team.id || index}`}
                                onChange={handleAccordionChange(`team-accordion-${team.id || index}`)}
                                sx={{ mb: 1 }}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="subtitle2">{team.name || `Team ${index + 1}`}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <ParticipantsForm
                                        participants={participants.filter(p => (p as any).teamId === team.id)}
                                        setParticipants={(newParticipants) => {
                                            const otherParticipants = participants.filter(p => (p as any).teamId !== team.id);
                                            setParticipants([...otherParticipants, ...newParticipants.map(p => Participant.parse({ ...p, teamId: team.id }))]);
                                        }}
                                        teams={teams}
                                        defaultTeam={team.id}
                                    />
                                </AccordionDetails>
                            </Accordion>
                        ))
                    ) : (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            No teams configured.
                        </Alert>
                    )}

                    {participants.filter(p => !(p as any).teamId).length > 0 && (
                        <Accordion
                            expanded={expandedAccordion === 'participants-without-team'}
                            onChange={handleAccordionChange('participants-without-team')}
                            sx={{ mt: 2 }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="subtitle2">Participants without Team</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <ParticipantsForm
                                    participants={participants.filter(p => !(p as any).teamId)}
                                    setParticipants={(newParticipants) => {
                                        const otherParticipants = participants.filter(p => (p as any).teamId);
                                        setParticipants([...otherParticipants, ...newParticipants.map(p => Participant.parse({ ...p }))]);
                                    }}
                                    teams={teams}
                                />
                            </AccordionDetails>
                        </Accordion>
                    )}
                </Box>
            ) : (
                <Box>
                    <ParticipantsForm
                        participants={participants}
                        setParticipants={setParticipants}
                        teams={[]}
                    />
                </Box>
            )}

            <Dialog open={isTeamsDialogOpen} onClose={handleCloseTeamsDialog} fullWidth maxWidth="sm">
                <DialogContent>
                    <TeamsForm teams={teams} setTeams={setTeams} />
                </DialogContent>
            </Dialog>
        </Paper>
    );
};

export default ManageTeamsForm;