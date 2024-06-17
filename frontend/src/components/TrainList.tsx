import React, { useState } from 'react';
import { Train, CallingPoint } from '../utils/interfaces'
import { TrainList as StyledTrainList, TrainItem, TrainInfo, TrainInfoItem, Value, Label, PopUp, PopUpContent } from './ProfileCard.styles'
import { Tooltip } from 'react-tooltip';

export default function TrainList({ trains }: { trains: Train[] }) {
    const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);

    const handleTrainClick = (train: Train) => {
        setSelectedTrain(train);
    };

    const closeTooltip = () => {
        setSelectedTrain(null);
    };

    return (
        <div>
            <StyledTrainList>
                {trains && trains.length > 0 ? (
                    trains.map((train, index) => (
                        <TrainItem
                            key={index}
                            data-tooltip-id={`tooltip-${train.service_id}`}
                            data-tooltip-place="right"
                            data-tooltip-content={`Train details for ${train.service_id}`}
                            onClick={() => handleTrainClick(train)}
                        >
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

            {
                selectedTrain && (
                    <Tooltip
                        id={`tooltip-${selectedTrain.service_id}`}
                        place="right"
                        clickable={true}
                    >
                        <PopUp>
                            <PopUpContent>
                                <h3>Calling Points for {selectedTrain.service_id}</h3>
                                <ul>
                                    {selectedTrain.subsequent_calling_points.map((point: CallingPoint, index) => (
                                        <li key={index}>
                                            {point.location_name} ({point.crs}): Scheduled: {point.st}, Estimated: {point.et}, Actual: {point.at}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={closeTooltip}>Close</button>
                            </PopUpContent>
                        </PopUp>
                    </Tooltip>
                )
            }
        </div>
    );
};
