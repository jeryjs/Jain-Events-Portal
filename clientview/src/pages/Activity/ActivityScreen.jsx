import React from 'react';
import { useParams, Link } from 'react-router-dom';

function MatchScreen() {
	const { eventId, activityId } = useParams();
	// Dummy details for match
	const dummyDetails = ['Detail A', 'Detail B', 'Detail C'];

	return (
		<div className="container">
			<h1>Match: {activityId}</h1>
			{/* Back to Event */}
			<div style={{ marginBottom: '1rem' }}>
				<Link 
					to={`/event/${eventId}`} 
					style={{
						padding: '0.5rem 1rem',
						backgroundColor: '#6c757d',
						color: '#fff',
						borderRadius: '4px',
						textDecoration: 'none'
					}}
				>
					Back to Event
				</Link>
			</div>
			{/* Match details */}
			<ul style={{ listStyle: 'none', padding: 0 }}>
				{dummyDetails.map((detail, index) => (
					<li 
						key={index} 
						style={{
							padding: '0.75rem',
							backgroundColor: '#f8f9fa',
							marginBottom: '0.5rem',
							borderRadius: '4px'
						}}
					>
						{detail}
					</li>
				))}
			</ul>
		</div>
	);
}

export default MatchScreen;
