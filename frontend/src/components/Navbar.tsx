import React from 'react';
import { Navbar as StyledNavbar, NavBrand, LogoutButton } from './ProfileList.styles';
import { useNavigate } from 'react-router';

export default function Navbar({onLogout}: { onLogout: () => void}) {
  return (
    <StyledNavbar>
      <NavBrand>Train App</NavBrand>
      <LogoutButton onClick={onLogout}>Logout</LogoutButton>
    </StyledNavbar>
  );
};
