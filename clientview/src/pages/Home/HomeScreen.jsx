import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button } from '@mui/material';

function HomeScreen() {
    // Dummy event entries with unique text-based IDs
    const dummyEvents = [
        { id: 'sportiza-2025', name: 'Sportiza 2025' },
        { id: 'culturals-2025', name: 'Culturals 2025' },
        { id: 'food-fest-2025', name: 'Food Fest 2025' }
    ];

    return (
        <Box className="container">
            <h1>Home</h1>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                {dummyEvents.map((event) => (
                    <Button
                        key={event.id}
                        component={Link}
                        to={`/${event.id}`}
                        sx={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            textAlign: 'center',
                            '&:hover': {
                                backgroundColor: '#0056b3'
                            }
                        }}
                    >
                        {event.name}
                    </Button>
                ))}
            </Box>
            <Box sx={{ marginTop: '2rem' }}>
                <a href={process.env.NODE_ENV == 'development' ? "http://localhost:5781/admin/" : "/admin"}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        textAlign: 'center',
                        '&:hover': {
                            backgroundColor: '#218838'
                        }
                    }}>
                    Go to '/admin'
                </a>
            </Box>
        </Box >
    );
}

export default HomeScreen;
