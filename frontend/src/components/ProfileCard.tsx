import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Watch } from 'react-loader-spinner';
import { Card, CardTitle, LoadingContainer, Button, Timestamp } from './ProfileCard.styles'
import  TrainList from './TrainList'
import { Train } from '../utils/interfaces'

interface ProfileCardProps {
  origins: string[];
  destinations: string[];
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
  onRefresh: () => void;
  trains?: Train[];
  lastFetchTime?: Date | null;
  loading: boolean;
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
  loading,
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
      <Button onClick={(e) => { e.stopPropagation(); onEdit(); }}>Edit</Button>
      <Button onClick={(e) => { e.stopPropagation(); onDelete(); }}>Delete</Button>
      <Button onClick={(e) => { e.stopPropagation(); onRefresh(); }}>Refresh</Button>
      {expanded && (loading ? (
        <LoadingContainer>
          <Watch
            visible={true}
            height="40"
            width="40"
            ariaLabel="watch-loading"
            wrapperStyle={{}}
            wrapperClass=""
            color="#4fa94d"          />
        </LoadingContainer>
      ) : (
          <>
            <TrainList trains={trains}/>
            {lastFetchTime && (
            <Timestamp>{formatDistanceToNow(new Date(lastFetchTime), { addSuffix: true })}</Timestamp>
          )}
          </>
        )
      )}
    </Card>
  );
}
