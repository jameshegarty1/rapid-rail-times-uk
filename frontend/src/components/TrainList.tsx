import React from 'react';
import { Train } from '../utils/interfaces'
import { TrainList as StyledTrainList, TrainItem, TrainInfo, TrainInfoItem, Value, Label } from './ProfileCard.styles'

export default function TrainList({trains}: {trains: Train[]}) {
  return (
    <StyledTrainList>
      {trains && trains.length > 0 ? (
                trains.map((train, index) => (
                  <TrainItem key={index}>
                    <div>
                  <strong>{train.scheduled_departure}</strong> from <strong>{train.origin}</strong> to <strong>{train.destination}</strong>
                  {train.via && <span> {train.via}</span>}
                </div>
                <TrainInfo>
                  <TrainInfoItem>
                    <Label>Estimated Departure:</Label>
                    <Value>{train.estimated_departure}</Value>
                  </TrainInfoItem>
                  <TrainInfoItem>
                    <Label>Platform:</Label>
                    <Value>{train.platform}</Value>
                  </TrainInfoItem>
                  <TrainInfoItem>
                    <Label>Operator:</Label>
                    <Value>{train.operator}</Value>
                  </TrainInfoItem>
                  <TrainInfoItem>
                    <Label>Length:</Label>
                    <Value>{train.length}</Value>
                  </TrainInfoItem>
                  <TrainInfoItem>
                    <Label>Status:</Label>
                    <Value>{train.is_cancelled ? 'Cancelled' : 'On Time'}</Value>
                  </TrainInfoItem>
                  {train.delay_reason && (
                    <TrainInfoItem>
                      <Label>Delay Reason:</Label>
                      <Value>{train.delay_reason}</Value>
                    </TrainInfoItem>
                  )}
                  {train.cancel_reason && (
                    <TrainInfoItem>
                      <Label>Cancel Reason:</Label>
                      <Value>{train.cancel_reason}</Value>
                    </TrainInfoItem>
                  )}
                </TrainInfo>
            </TrainItem>
                ))
              ) : (
                <p>No trains.</p>
              )}
    </StyledTrainList>
  );
};
