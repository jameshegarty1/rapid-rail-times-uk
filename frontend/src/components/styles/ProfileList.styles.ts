import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Roboto', sans-serif;
  background-color: #f8f9fa;
`;

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap; // Allow items to wrap to the next line
  gap: 1rem; // Add some space between profile cards

  @media (min-width: 768px) {
    gap: 2rem; // Increase gap for larger screens
  }
`;


export const Col = styled.div`
  width: 100%; // Make each column full width on small screens

  @media (min-width: 768px) {
    flex: 0 0 48%; // Take up roughly half the row on larger screens
  }

  @media (min-width: 1024px) {
    flex: 0 0 31%; // Take up roughly a third of the row on larger screens
  }

  display: flex;
  flex-direction: column;
  align-items: stretch;
`;


export const Error = styled.p`
  color: red;
  font-weight: bold;
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
  background-color: #ffffff;
  padding: 20px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

export const Button = styled.button`
  background-color: #007bff;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

