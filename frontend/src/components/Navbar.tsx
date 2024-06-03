import React from 'react';
import { Navbar as StyledNavbar, NavBrand, LogoutButton } from './ProfileList.styles';
import { useNavigate } from 'react-router';

interface NavbarProps {
  onLogout: () => ;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  return (
    <StyledNavbar>
      <NavBrand>Train App</NavBrand>
      <LogoutButton onClick={onLogout}>Logout</LogoutButton>
    </StyledNavbar>
  );
};

export default Navbar;

