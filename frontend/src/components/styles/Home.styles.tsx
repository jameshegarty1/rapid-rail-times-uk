import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f0f2f5;
`;

export const Navbar = styled.nav`
  width: 100%;
  padding: 1rem 2rem;
  background-color: #343a40;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const NavLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

export const NavLink = styled.a`
  color: #61dafb;
  cursor: pointer;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

export const AuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
`;

export const Button = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

export const Message = styled.p<{ error?: boolean }>`
  color: ${props => (props.error ? 'red' : 'green')};
  font-size: 1rem;
  margin-top: 1rem;
`;

