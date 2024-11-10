import React, { useState } from 'react';
import { Train, CallingPoint } from 'utils/interfaces';
import { TrainList as StyledTrainList, TrainItem, TrainInfo, TrainInfoItem, Value, Label, ExpandedTrain, CallingPointList, CallingPointItem, CallingPointsContainer, CallingPointsTitle, Time, EstimatedTime } from 'components/styles/ProfileCard.styles';

interface TrainListProps {
  trains?: Train[];
  destinations: string[];
}

export default function TrainList({ trains = [], destinations }: TrainListProps) {
    const [expandedTrains, setExpandedTrains] = useState<{ [key: string]: boolean }>({});
    const handleTrainClick = (trainId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedTrains(prev => ({ ...prev, [trainId]: !prev[trainId] }));
    };

    console.log('Rendering TrainList with trains:', trains);

    return (
        <StyledTrainList>
            {trains.length > 0 ? (
                trains.map((train, index) => (
                    <TrainItem
                        key={index}
                        onClick={(e) => handleTrainClick(train.service_id, e)}
                    >
                        <div>
                            <strong>{train.scheduled_departure}</strong> from <strong>{train.origin}</strong> to <strong>{train.destination}</strong>
                            {train.via && <span> {train.via}</span>}
                        </div>
                        {expandedTrains[train.service_id] && (
                            <ExpandedTrain>
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
                                <CallingPointsContainer>
                                    <CallingPointsTitle>Calling Points:</CallingPointsTitle>
                                    <CallingPointList>
                                        {train.subsequent_calling_points.map((point: CallingPoint, index) => {
                                            const isDelayed = point.et != 'On time';
                                            const isHighlighted = destinations.includes(point.crs);
                                            return (
                                                <CallingPointItem key={index} $highlight={isHighlighted}>
                                                    <Time $delayed={isDelayed}>{point.st}</Time>
                                                    {isDelayed && <EstimatedTime>{point.et}</EstimatedTime>}
                                                    <span>{point.location_name} ({point.crs})</span>
                                                </CallingPointItem>
                                            );
                                        })}
                                    </CallingPointList>
                                </CallingPointsContainer>
                            </ExpandedTrain>
                        )}
                    </TrainItem>
                ))
            ) : (
                <p>No trains.</p>
            )}
        </StyledTrainList>
    );
}
