import { Box, Container, Skeleton } from "@mui/material";

// Loading Skeleton
export const ActivitySkeleton = () => (
    <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
            <Skeleton variant="text" width="60%" height={40} />
        </Box>

        <Skeleton variant="rounded" height={200} sx={{ mb: 4, borderRadius: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            {[1, 2].map(i => (
                <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 2 }} />
            ))}
        </Box>

        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} />
    </Container>
);