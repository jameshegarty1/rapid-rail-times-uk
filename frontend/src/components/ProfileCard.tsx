import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Hourglass } from 'react-loader-spinner';
import { Card, CardTitle, LoadingContainer, Button } from './ProfileCard.styles'
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
          <Hourglass
            visible={true}
            height="80"
            width="80"
            ariaLabel="hourglass-loading"
            wrapperStyle={{}}
            wrapperClass=""
            colors={['#306cce', '#72a1ed']}
          />
        </LoadingContainer>
      ) : (
          <>
            <TrainList trains={trains}/>
            {lastFetchTime && (
              <p>{formatDistanceToNow(new Date(lastFetchTime), { addSuffix: true })}</p>
            )}
          </>
        )
      )}
    </Card>
  );
}
