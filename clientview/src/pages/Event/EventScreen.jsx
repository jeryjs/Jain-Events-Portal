import React from 'react';
import { useParams, Link } from 'react-router-dom';

function EventScreen() {
    const { eventId } = useParams();
    // Dummy matches for this event with unique text-based IDs
    const dummyMatches = [
        { id: 'match-1', name: 'Match 1' },
        { id: 'match-2', name: 'Match 2' },
        { id: 'match-3', name: 'Match 3' }
    ];

    return (
        <div className="container">
            <h1>Event: {eventId}</h1>
            {/* Back to Home */}
            <div style={{ marginBottom: '1rem' }}>
                <Link 
                    to="/" 
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#6c757d',
                        color: '#fff',
                        borderRadius: '4px',
                        textDecoration: 'none'
                    }}
                >
                    Back to Home
                </Link>
            </div>
            {/* List of match buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {dummyMatches.map((match) => (
                    <Link
                        key={match.id}
                        to={`/event/${eventId}/${match.id}`}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#28a745',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            textAlign: 'center'
                        }}
                    >
                        {match.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default EventScreen;
