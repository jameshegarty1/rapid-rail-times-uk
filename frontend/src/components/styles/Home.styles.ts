import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  backgroundColor: '#f5f5f5', // Light grey background
  minHeight: '100vh', // Ensure it covers the full viewport height
`;

export const AuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  background-color: #f8f9fa;
  margin-top: 2rem;
`;

export const Button = styled.button`
  background-color: #007bff;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  margin: 0.5rem;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

export const Message = styled.p<{ error?: boolean }>`
  color: ${({ error }) => (error ? 'red' : 'green')};
  margin-bottom: 1rem;
`;

// Styles for the Navbar component
export const NavbarContainer = styled.nav`
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

export const NavLinks = styled.div`
  display: flex;
  gap: 10px;
`;

export const NavLink = styled.a`
  color: #fff;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
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
