import styled from 'styled-components';

export const Navbar = styled.nav`
  background-color: #343a40;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const NavBrand = styled.div`
  font-size: 1.5rem;
`;

export const LogoutButton = styled.button`
  background-color: transparent;
  border: 1px solid white;
  color: white;
  padding: 0.5rem 1rem;
  cursor: pointer;
  &:hover {
    background-color: white;
    color: #343a40;
  }
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: -1rem;
`;

export const Col = styled.div`
  flex: 1;
  padding: 1rem;
  max-width: 33.33%;
`;

export const Card = styled.div`
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.02);
  }
`;

export const CardTitle = styled.h5`
  margin-bottom: 1rem;
`;

export const Button = styled.button`
  background-color: #007bff;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

export const Form = styled.form`
  margin-bottom: 2rem;
`;

export const Input = styled.input`
  width: calc(33.33% - 1rem);
  margin-right: 1rem;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
`;

export const Error = styled.p`
  color: red;
`;

export const TrainList = styled.ul`
  list-style: none;
  padding: 0;
`;

export const TrainItem = styled.li`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
`;

