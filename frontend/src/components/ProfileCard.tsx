import React from 'react';
import { Card, CardTitle, Button } from './ProfileList.styles';

export default function ProfileCard({
  origin,
  destination,
  onEdit,
  onDelete,
  onClick,
}: {
  origin: string;
  destination: string;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  return (
    <Card onClick={onClick}>
      <CardTitle>{origin} to {destination}</CardTitle>
      <Button onClick={onEdit}>Edit</Button>
      <Button onClick={onDelete}>Delete</Button>
    </Card>
  );
};
