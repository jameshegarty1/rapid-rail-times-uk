/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { FC, useState } from 'react';
import {
  Paper,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Face, Fingerprint } from '@mui/icons-material';
import { Alert } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router';

import { login, isAuthenticated } from '../utils/auth';

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

export const Login: FC = () => {
  const classes = useStyles;
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (_: React.MouseEvent) => {
    setError('');
    try {
      const data = await login(email, password);

      if (data) {
        console.log("Login success! Going to Profiles List...")
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
        <br />
        <Grid container alignItems="center">
          {error && (
            <Grid item>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
        </Grid>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <FormControlLabel
              control={<Checkbox color="primary" />}
              label="Remember me"
            />
          </Grid>
          <Grid item>
            <Button
              disableFocusRipple
              disableRipple
              css={classes.button}
              variant="text"
              color="primary"
            >
              Forgot password ?
            </Button>
          </Grid>
        </Grid>
        <Grid container justifyContent="center" css={classes.marginTop}>
          {' '}
          <Button
            variant="outlined"
            color="primary"
            css={classes.button}
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </Button>{' '}
          &nbsp;
          <Button
            variant="outlined"
            color="primary"
            css={classes.button}
            onClick={handleSubmit}
          >
            Login
          </Button>
        </Grid>
      </div>
    </Paper>
  );
};

export default Login
