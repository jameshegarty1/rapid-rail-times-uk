/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { FC, useState } from 'react';
import { isAuthenticated } from '../utils/auth';

const linkStyle = css`
  color: #61dafb;
  cursor: pointer;
`;

export const Home: FC = () => {
  console.log('Home component rendered');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  return (
    <div> 
      <nav>
        <a css={linkStyle} href="/admin">
          Admin Dashboard
        </a>
        <a css={linkStyle} href="/protected">
          Protected Route
        </a>
        {isAuthenticated() ? (
          <a css={linkStyle} href="/logout">
            Logout
          </a>
        ) : (
          <>
            <a css={linkStyle} href="/login">
              Login
            </a>
            <a css={linkStyle} href="/signup">
              Sign Up
            </a>
          </>
        )}
        <a css={linkStyle} href="/profiles">
          See profiles
        </a>
      </nav>
    </div>
  );
};

