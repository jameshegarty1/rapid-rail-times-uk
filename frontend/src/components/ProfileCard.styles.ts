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

export const CardTitle = styled.h5`
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: #333;
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
