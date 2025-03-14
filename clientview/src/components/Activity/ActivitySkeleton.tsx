import { Box, Container, Skeleton } from "@mui/material";

// Loading Skeleton
export const ActivitySkeleton = () => {
    return (
      <Container maxWidth="lg" sx={{ py: 4, color: 'text.primary' }}>
        {/* Hero Container Skeleton */}
        <Box sx={{ 
          borderRadius: 4, 
          p: 3, 
          mb: 4, 
        }}>
          {/* Header with back button */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Skeleton variant="text" width="60%" height={40} />
          </Box>
  
          {/* Activity info */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ width: '100%' }}>
              <Skeleton variant="rounded" width={120} height={32} sx={{ mb: 2 }} />
              
              {/* Date info */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                <Skeleton variant="text" width="40%" height={24} />
              </Box>
              
              {/* Participants */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                <Skeleton variant="text" width="20%" height={24} />
              </Box>
              
              {/* Participant avatars */}
              <Box sx={{ display: 'flex', mt: 1 }}>
                {[...Array(5)].map((_, i) => (
                  <Skeleton 
                    key={i} 
                    variant="circular" 
                    width={40} 
                    height={40} 
                    sx={{ 
                      mr: -0.5,
                      animation: 'pulse 1.5s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 0.6 },
                        '50%': { opacity: 1 },
                        '100%': { opacity: 0.6 }
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
  
        {/* Content Sections */}
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" width="100%" height={100} sx={{ mb: 3 }} />
          <Skeleton variant="text" width="80%" height={20} />
          <Skeleton variant="text" width="70%" height={20} />
          <Skeleton variant="text" width="75%" height={20} />
          
          {/* Button area */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 3 }}>
            <Skeleton variant="rounded" width={120} height={36} sx={{ mr: 2 }} />
            <Skeleton variant="rounded" width={120} height={36} />
          </Box>
        </Box>
      </Container>
    );
  };