import styled from 'styled-components';

export const Card = styled.div`
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  width: 100%;
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const CardTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.1rem;
  font-size: 1.25rem;
  color: #333;
`;

export const RouteContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
`;

export const RouteRow = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 1rem;
  color: #555;
`;
export const RouteColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StationName = styled.span`
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
  display: inline-block;
`;

export const TrainList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const TrainItem = styled.li`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
`;

export const TrainInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

export const Label = styled.span`
  font-weight: bold;
`;

export const Value = styled.span`
  text-align: right;
`;

export const TrainInfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid #dee2e6;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
`;

export const Button = styled.button`
  background-color: #007bff;
  border: none;
  color: white;
  padding: 0.25rem 0.5rem;
  margin-right: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
  margin-bottom: 1rem;

  &:hover {
    background-color: #0056b3;
  }
`;

export const Timestamp = styled.p`
  font-size: 0.85rem; /* Smaller font size */
  color: #657786; /* Twitter-like grey color */
  margin-top: 0.5rem;
  text-align: right; /* Align the timestamp to the right */
`;


export const ExpandedTrain = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #e9ecef;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
`;

export const CallingPointList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const CallingPointItem = styled.li<{ $highlight?: boolean }>`
  background-color: ${({ $highlight }) => ($highlight ? '#ffd700' : 'transparent')};
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  font-weight: ${({ $highlight }) => ($highlight ? 'bold' : 'normal')};
  display: flex;
  align-items: center;
`;

export const Time = styled.span<{ $delayed?: boolean }>`
  text-decoration: ${({ $delayed }) => ($delayed ? 'line-through' : 'none')};
  margin-right: 0.5rem;
`;

export const EstimatedTime = styled.span`
  color: red; /* Customize as needed */
  margin-left: 0.5rem;
`;


export const CallingPointsContainer = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
`;

export const CallingPointsTitle = styled.h3`
  margin-bottom: 0.5rem;
`;

export const HorizontalLine = styled.hr`
  width: 100%;
  border: none;
  border-top: 1px solid #ddd;
  margin: 0.5rem 0;
`;
