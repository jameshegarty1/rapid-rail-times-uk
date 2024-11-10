import styled from '@emotion/styled';
import React, { useState } from 'react';
import { Grid, TextField, Button, Alert } from '@mui/material';
import Paper from '@mui/material/Paper';
import { Face, Fingerprint } from '@mui/icons-material';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router';

import { signUp, isAuthenticated } from '../utils/auth';

const StyledDiv = styled.div`
  margin: 16px;
`;

export default function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    // Password confirmation validation
    if (password !== passwordConfirmation) setError('Passwords do not match');
    else {
      setError('');
      try {
        const data = await signUp(email, password, passwordConfirmation);

        if (data) {
          navigate('/');
        }
      } catch (err) {
        if (err instanceof Error) {
          // handle errors thrown from frontend
          setError(err.message);
        } else {
          // handle errors thrown from backend
          setError(String(err));
        }
      }
    }
  };

  return isAuthenticated() ? (
    <Navigate to="/" />
  ) : (
    <Paper sx={{ padding: '16px' }}>
      <StyledDiv>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item>
            <Face />
          </Grid>
          <Grid item md sm xs>
            <TextField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.currentTarget.value)
              }
              fullWidth
              autoFocus
              required
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item>
            <Fingerprint />
          </Grid>
          <Grid item md sm xs>
            <TextField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.currentTarget.value)
              }
              fullWidth
              required
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item>
            <Fingerprint />
          </Grid>
          <Grid item md sm xs>
            <TextField
              id="passwordConfirmation"
              label="Confirm password"
              type="password"
              value={passwordConfirmation}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPasswordConfirmation(e.currentTarget.value)
              }
              fullWidth
              required
            />
          </Grid>
        </Grid>
        <br />
        <Grid container alignItems="center">
          {error && (
            <Grid item>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
        </Grid>
        <Grid container justifyContent="center" sx={{ marginTop: '10px' }}>
          <Button
            variant="outlined"
            color="primary"
            sx={{ textTransform: 'none' }}
            onClick={handleSubmit}
          >
            Sign Up
          </Button>
        </Grid>
      </StyledDiv>
    </Paper>
  );
}
