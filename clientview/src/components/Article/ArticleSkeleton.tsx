import PageTransition from '@components/shared/PageTransition';
import { Box, Container, Grid2 as Grid, Paper, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';

const ArticleSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <PageTransition>
      <Box sx={{ position: 'relative' }}>
        {/* Hero section skeleton */}
        <Box
          sx={{
            height: '40vh',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            position: 'relative',
            mb: 4
          }}
        >
          <Box sx={{ position: 'absolute', bottom: 24, left: 24, width: '60%' }}>
            <Skeleton variant="text" height={60} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={24} />
          </Box>
        </Box>

        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Main Content Area */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper elevation={0} sx={{ p: 3 }}>
                {/* Article header */}
                <Box sx={{ mb: 4 }}>
                  <Skeleton variant="text" height={42} sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                    <Box>
                      <Skeleton variant="text" width={120} height={24} />
                      <Skeleton variant="text" width={80} height={20} />
                    </Box>
                  </Box>
                </Box>

                {/* Article content */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <React.Fragment key={i}>
                    <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="90%" height={20} sx={{ mb: 3 }} />
                  </React.Fragment>
                ))}

                {/* Article image placeholder */}
                <Skeleton variant="rectangular" height={240} sx={{ my: 3, borderRadius: 1 }} />

                {/* More content */}
                {Array.from({ length: 4 }).map((_, i) => (
                  <React.Fragment key={i + 8}>
                    <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="85%" height={20} sx={{ mb: 3 }} />
                  </React.Fragment>
                ))}
              </Paper>
            </Grid>

            {/* Recent Articles Sidebar */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
                <Paper elevation={0} sx={{ p: 3 }}>
                  <Skeleton variant="text" height={32} sx={{ mb: 2 }} />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', mb: 3 }}>
                      <Skeleton variant="rectangular" width={80} height={60} sx={{ mr: 2, borderRadius: 1 }} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="60%" height={16} />
                      </Box>
                    </Box>
                  ))}
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </PageTransition>
  );
};

export default ArticleSkeleton;