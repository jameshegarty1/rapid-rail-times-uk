import React, { FC, useState } from 'react';
import { isAuthenticated } from '../utils/auth';
import { Container, Navbar, NavLinks, NavLink, AuthContainer, Button, Message } from './Home.styles';

export default function Home() {
  console.log('Home component rendered');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  return (
    <Container>
      <Navbar>
        <NavLinks>
          <NavLink href="/admin">Admin Dashboard</NavLink>
          <NavLink href="/protected">Protected Route</NavLink>
          <NavLink href="/profiles">See profiles</NavLink>
        </NavLinks>
        <NavLinks>
          {isAuthenticated() ? (
            <NavLink href="/logout">Logout</NavLink>
          ) : (
            <>
              <NavLink href="/login">Login</NavLink>
              <NavLink href="/signup">Sign Up</NavLink>
            </>
          )}
        </NavLinks>
      </Navbar>
      <AuthContainer>
        {isAuthenticated() ? (
          <Message>Welcome back!</Message>
        ) : (
          <>
            <Button onClick={() => window.location.href = '/login'}>Login</Button>
            <Button onClick={() => window.location.href = '/signup'}>Sign Up</Button>
          </>
        )}
        {message && <Message error={!!error}>{message}</Message>}
      </AuthContainer>
    </Container>
  );
};
