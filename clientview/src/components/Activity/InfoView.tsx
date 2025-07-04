import { Box, Divider, Paper, styled, Typography, useTheme } from "@mui/material";
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';

import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

// Styled components
const Section = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 1.5,
    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.07)}`,
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1),
    },
}));

const ContentContainer = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
    ".bn-container": {
        border: 'none',
    },
    ".bn-editor": {
        padding: 0,
    },
    ".bn-inline-content": {
        fontSize: '1rem',
    }
}));

// Info Activity View Component
export const InfoView = ({ activity }) => {
    const theme = useTheme();

    if (!activity) {
        return (
            <StyledPaper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    Information Not Available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    The requested information could not be found.
                </Typography>
            </StyledPaper>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Section>
                {/* Main content */}
                <StyledPaper>
                    <Divider sx={{
                        mb: 3,
                        "&::before, &::after": {
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                        }
                    }}>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ px: 2, fontWeight: 500 }}
                        >
                            ...
                        </Typography>
                    </Divider>

                    {/* Render Markdown with HTML support */}
                    <ContentContainer>
                        <Markdown remarkRehypeOptions={{ allowDangerousHtml: true }} rehypePlugins={[rehypeRaw]}>
                            {activity.content}
                        </Markdown>
                    </ContentContainer>
                </StyledPaper>
            </Section>
        </motion.div>
    );
};

export default InfoView;
