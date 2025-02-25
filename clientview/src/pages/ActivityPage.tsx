import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const ActivityContainer = styled('div')`
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
`;
const BackButton = styled(Link)(({ theme }) => `
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #6c757d;
  color: ${theme.palette.text.primary};
  border-radius: 4px;
  text-decoration: none;
`);
const DetailList = styled('ul')`
  list-style: none;
  padding: 0;
`;
const DetailItem = styled('li')`
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
`;

function ActivityPage() {
  const { eventId, activityId } = useParams<{ eventId: string; activityId: string }>();
  const dummyDetails = ['Detail A', 'Detail B', 'Detail C'];

  return (
    <ActivityContainer>
      <h1>Activity: {activityId}</h1>
      <div style={{ marginBottom: '1rem' }}>
        <BackButton to={`/${eventId}`}>Back to Event</BackButton>
      </div>
      <DetailList>
        {dummyDetails.map((detail, index) => (
          <DetailItem key={index}>{detail}</DetailItem>
        ))}
      </DetailList>
    </ActivityContainer>
  );
}

export default ActivityPage;
