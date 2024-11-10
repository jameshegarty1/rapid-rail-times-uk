import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Watch } from 'react-loader-spinner';
import { Card, CardTitle, LoadingContainer, Button, Timestamp, RouteRow, RouteColumn, RouteContainer, Label, StationName, HorizontalLine } from 'components/styles/ProfileCard.styles'
import TrainList from 'components/TrainList'
import { Train } from 'utils/interfaces'

import stationData from 'config/stations.json'

const createAlphaToNameMap = (stations: { ALPHA: string; NAME: string }[]) => {
    const map: { [key: string]: string } = {};
    stations.forEach(station => {
        map[station.ALPHA] = station.NAME;
    });
    return map;
};

const alphaToNameMap = createAlphaToNameMap(stationData);

const getNameFromAlpha = (alpha: string) => {
    return alphaToNameMap[alpha] || alpha;
};

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

    const handleToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(!expanded);
        if (!expanded) {
            onClick();
        }
    };

    return (
        <Card onClick={handleToggleExpand}>
            <CardTitle>
                <RouteContainer>
                    <RouteColumn>
                        <Label>From:</Label>
                        {origins.map((origin, index) => (
                            <React.Fragment key={index}>
                                <RouteRow>
                                    <StationName>{getNameFromAlpha(origin)}</StationName>
                                </RouteRow>
                                {index < origins.length - 1 && <HorizontalLine />}
                            </React.Fragment>
                        ))}
                    </RouteColumn>
                    <RouteColumn>
                        {destinations.length > 0 && (
                            <>
                                <Label>To:</Label>
                                {destinations.map((destination, index) => (
                                    <React.Fragment key={index}>
                                        <RouteRow>
                                            <StationName>{getNameFromAlpha(destination)}</StationName>
                                        </RouteRow>
                                        {index < destinations.length - 1 && <HorizontalLine />}
                                    </React.Fragment>
                                ))}
                            </>
                        )}
                    </RouteColumn>
                </RouteContainer>
                <div>
                    <Button onClick={(e) => { e.stopPropagation(); onEdit(); }}>Edit</Button>
                    <Button onClick={(e) => { e.stopPropagation(); onDelete(); }}>Delete</Button>
                    <Button onClick={(e) => { e.stopPropagation(); onRefresh(); }}>Refresh</Button>
                </div>
            </CardTitle>
            {expanded && (loading ? (
                <LoadingContainer>
                    <Watch
                        visible={true}
                        height="40"
                        width="40"
                        ariaLabel="watch-loading"
                        wrapperStyle={{}}
                        wrapperClass=""
                        color="#4fa94d" />
                </LoadingContainer>
            ) : (
                <>
                    <TrainList trains={trains} destinations={destinations} />
                    {lastFetchTime && (
                        <Timestamp>{formatDistanceToNow(new Date(lastFetchTime), { addSuffix: true })}</Timestamp>
                    )}
                </>
            )
            )}
        </Card>
    );
}
