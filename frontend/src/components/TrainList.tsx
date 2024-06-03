import React from 'react';
import { TrainList as StyledTrainList, TrainItem } from './ProfileList.styles';

interface Train {
  scheduled_departure: string;
  estimated_departure: string;
  destination: string;
}

interface TrainListProps {
  trains: Train[];
}

const TrainList: React.FC<TrainListProps> = ({ trains }) => {
  return (
    <StyledTrainList>
      {trains.map((train, index) => (
        <TrainItem key={index}>
          {train.scheduled_departure} to {train.destination} - Scheduled: {train.scheduled_departure} - Estimated: {train.estimated_departure}
        </TrainItem>
      ))}
    </StyledTrainList>
  );
};

export default TrainList;

