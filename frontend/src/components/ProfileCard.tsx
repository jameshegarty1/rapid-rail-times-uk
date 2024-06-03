import React from 'react';
import { Card, CardTitle, Button } from './ProfileList.styles';

interface ProfileCardProps {
  id: number;
  origin: string;
  destination: string;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  origin,
  destination,
  onEdit,
  onDelete,
  onClick,
}) => {
  return (
    <Card onClick={onClick}>
      <CardTitle>{origin} to {destination}</CardTitle>
      <Button onClick={onEdit}>Edit</Button>
      <Button onClick={onDelete}>Delete</Button>
    </Card>
  );
};

export default ProfileCard;

