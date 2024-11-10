import styled from 'styled-components';

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

