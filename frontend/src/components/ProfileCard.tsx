import React from 'react';
import { Card, CardTitle, Button } from './ProfileList.styles';

export default function ProfileCard({
  origins,
  destinations,
  onEdit,
  onDelete,
  onClick,
}: {
  origins: string[];
  destinations: string[];
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  return (
    <Card onClick={onClick}>
      <CardTitle>{origins.join(', ')} to {destinations.join(', ')}</CardTitle>
      <Button onClick={(e) => { e.stopPropagation(); onEdit(); }}>Edit</Button>
      <Button onClick={(e) => { e.stopPropagation(); onDelete(); }}>Delete</Button>
    </Card>
  );
}

