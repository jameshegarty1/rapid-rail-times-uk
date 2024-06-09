import React, { useState } from 'react';
import styled from 'styled-components';
import { formatDistanceToNow } from 'date-fns';

const Card = styled.div`
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
  width: 100%;
  &:hover {
    transform: scale(1.02);
  }
`;

const CardTitle = styled.h5`
  margin-bottom: 1rem;
`;

const TrainList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TrainItem = styled.li`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
`;

interface ProfileCardProps {
  origins: string[];
  destinations: string[];
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
  onRefresh: () => void;
  trains?: Train[];
  lastFetchTime?: Date | null;
}

interface Train {
  scheduled_departure: string;
  estimated_departure: string;
  destination: string;
}

export default function ProfileCard({
  origins, 
  destinations, 
  onEdit, 
  onDelete, 
  onRefresh, 
  onClick, 
  trains = [],
  lastFetchTime,
}: ProfileCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
    if (!expanded) {
      onClick();
    }
  };

  return (
    <Card onClick={handleToggleExpand}>
      <CardTitle>{`From: ${origins.join(', ')} To: ${destinations.join(', ')}`}</CardTitle>
      <button onClick={(e) => { e.stopPropagation(); onEdit(); }}>Edit</button>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }}>Delete</button>
      <button onClick={(e) => { e.stopPropagation(); onRefresh(); }}>Refresh</button>
      {expanded && trains && (
        <TrainList>
          {trains.map((train, index) => (
            <TrainItem key={index}>
              {train.scheduled_departure} to {train.destination} - Scheduled: {train.scheduled_departure} - Estimated: {train.estimated_departure}
            </TrainItem>
          ))}
        </TrainList>
      )}
      {expanded && lastFetchTime && (
        <p>{formatDistanceToNow(new Date(lastFetchTime), { addSuffix: true })}</p>
      )}
    </Card>
  );
}

