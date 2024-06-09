import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

export const Row = styled.div`
  display: flex;
  flex-direction: column; // Change to column direction
  gap: 1rem; // Add some space between profile cards
`;

export const Col = styled.div`
  width: 100%; // Make each column full width
`;

export const Error = styled.p`
  color: red;
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
  padding: 0.5rem;
`;

export const Form = styled.form`
  margin-bottom: 2rem;
`;

export const Button = styled.button`
  background-color: #007bff;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;
