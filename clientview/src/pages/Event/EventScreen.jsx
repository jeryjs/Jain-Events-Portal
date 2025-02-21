import React from 'react';
import { useParams, Link } from 'react-router-dom';

function EventScreen() {
    const { eventId } = useParams();
    // Dummy Activities for this event with unique text-based IDs
    const dummyActivities = [
        { id: 'activity-1', name: 'Activity 1' },
        { id: 'activity-2', name: 'Activity 2' },
        { id: 'activity-3', name: 'Activity 3' }
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
            {/* List of Activity buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {dummyActivities.map((Activity) => (
                    <Link
                        key={Activity.id}
                        to={`/${eventId}/${Activity.id}`}
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
                        {Activity.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default EventScreen;
