import React from 'react';
import { Navbar as StyledNavbar, NavBrand, LogoutButton } from './ProfileList.styles';
import { useNavigate } from 'react-router';

export default function Navbar({onLogout}: { onLogout: () => void}) {
  const navigate = useNavigate();
  const handleLogout = () => {
    onLogout();
    navigate('/logout');
  };
  return (
    <StyledNavbar>
      <NavBrand>Train App</NavBrand>
      <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
    </StyledNavbar>
  );
};
