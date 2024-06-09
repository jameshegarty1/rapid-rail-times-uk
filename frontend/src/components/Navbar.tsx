import React from 'react';
import { isAuthenticated } from '../utils/auth';
import { NavbarContainer, NavLinks, NavLink, NavBrand, LogoutButton } from './Navbar.styles';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {

  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('Logging out');
    navigate('/logout');
  };

  return (
    <NavbarContainer>
      <NavBrand>Rapid Rail Times UK</NavBrand>
      <NavLinks>
        {isAuthenticated() ? (
          <>
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
          </>
        ) : (
          <>
            <NavLink href="/login">Login</NavLink>
            <NavLink href="/signup">Sign Up</NavLink>
          </>
        )}
      </NavLinks>
    </NavbarContainer>
  );
};
