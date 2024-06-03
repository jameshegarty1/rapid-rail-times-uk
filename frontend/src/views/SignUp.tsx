/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { FC, useState } from 'react';
import { Paper, Grid, TextField, Button, Alert } from '@mui/material';
import { Face, Fingerprint } from '@mui/icons-material';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router';

import { signUp, isAuthenticated } from '../utils/auth';

const useStyles = {
  margin: css`
    margin: 16px;
  `,
  padding: css`
    padding: 8px;
  `,
  button: css`
    text-transform: none;
  `,
  marginTop: css`
    margin-top: 10px;
  `,
};

export const SignUp: FC = () => {
  const classes = useStyles;
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (_: React.MouseEvent) => {
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
    <Paper css={classes.padding}>
      <div css={classes.margin}>
        <Grid container spacing={8} alignItems="flex-end">
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
        <Grid container spacing={8} alignItems="flex-end">
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
        <Grid container spacing={8} alignItems="flex-end">
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
        <Grid container justifyContent="center" css={classes.marginTop}>
          <Button
            variant="outlined"
            color="primary"
            css={classes.button}
            onClick={handleSubmit}
          >
            Sign Up
          </Button>
        </Grid>
      </div>
    </Paper>
  );
};
