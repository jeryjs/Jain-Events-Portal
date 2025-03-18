import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { Box, Divider, Paper, styled, Typography, useTheme } from "@mui/material";
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Function to detect if content is likely HTML
const isHtmlContent = (content: string): boolean => {
    if (!content) return false;
    // Check for common HTML tags with a more precise pattern
    const htmlTagPattern = /<\/?[\w\s="/.':;#-\/\?]+>/i;
    return htmlTagPattern.test(content);
};

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
    },
    // Specific blockNote style overrides
    "& h1, & h2, & h3, & h4, & h5, & h6": {
        color: theme.palette.text.primary,
        fontWeight: 600,
    },
    "& a": {
        color: theme.palette.primary.main,
    },
    "& img": {
        maxWidth: "100%",
        borderRadius: theme.shape.borderRadius,
    }
}));

// HTML content container with styled components
const HtmlContainer = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
    // Apply the same styling as BlockNote content for consistency
    "& h1, & h2, & h3, & h4, & h5, & h6": {
        color: theme.palette.text.primary,
        fontWeight: 600,
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
    },
    "& h1": { fontSize: '2rem' },
    "& h2": { fontSize: '1.75rem' },
    "& h3": { fontSize: '1.5rem' },
    "& h4": { fontSize: '1.25rem' },
    "& h5": { fontSize: '1.125rem' },
    "& h6": { fontSize: '1rem' },
    "& p": {
        marginBottom: theme.spacing(2),
        lineHeight: 1.6,
    },
    "& a": {
        color: theme.palette.primary.main,
        textDecoration: 'none',
        "&:hover": {
            textDecoration: 'underline',
        }
    },
    "& img": {
        maxWidth: "100%",
        borderRadius: theme.shape.borderRadius,
        margin: theme.spacing(1, 0),
    },
    "& ul, & ol": {
        marginBottom: theme.spacing(2),
        paddingLeft: theme.spacing(3),
    },
    "& li": {
        marginBottom: theme.spacing(0.5),
    },
    "& table": {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: theme.spacing(2),
        "& th, & td": {
            padding: theme.spacing(0.75),
            border: `1px solid ${theme.palette.divider}`,
        },
        "& th": {
            backgroundColor: alpha(theme.palette.primary.light, 0.1),
        }
    }
}));

// Info Activity View Component
export const InfoView = ({ activity }) => {
    const theme = useTheme();
    const editor = useCreateBlockNote({});
    const [isHtml, setIsHtml] = useState(false);

    // Load content and detect its type when activity changes
    useEffect(() => {
        if (activity?.content) {
            const contentIsHtml = isHtmlContent(activity.content);
            setIsHtml(contentIsHtml);

            // Only parse to BlockNote if it's not HTML
            if (!contentIsHtml) {
                editor.tryParseMarkdownToBlocks(activity.content).then((blocks) => {
                    editor.replaceBlocks(editor.document, blocks);
                });
            }
        }
    }, [activity?.id, activity?.content]);

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
                            INFORMATION
                        </Typography>
                    </Divider>
                    
                    {isHtml ? (
                        // Render HTML content
                        <HtmlContainer
                            dangerouslySetInnerHTML={{ __html: activity.content }}
                            className="html-content"
                        />
                    ) : (
                        // Render Markdown with BlockNote
                        <ContentContainer>
                            <BlockNoteView
                                editor={editor}
                                editable={false}
                                theme={theme.palette.mode}
                            />
                        </ContentContainer>
                    )}
                </StyledPaper>
            </Section>
        </motion.div>
    );
};

export default InfoView;
