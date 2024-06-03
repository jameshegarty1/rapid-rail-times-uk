/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { FC, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Home, Login, SignUp, Protected, PrivateRoute } from './views';
import { Admin } from './admin';
import { logout } from './utils/auth';

import ProfileList from './components/ProfileList';

const useStyles = {
  app: css`
    text-align: center;
  `,
  header: css`
    background-color: #282c34;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: calc(10px + 2vmin);
    color: white;
  `,
};

const AppRoutes: FC = () => {
  useEffect(() => {
    console.log('AppRoutes mounted');
  }, []);

  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profiles" element={<ProfileList />} />
        <Route path="/protected" element={<PrivateRoute element={<Protected />} />} />
        <Route path="/logout" element={<LogoutHandler />} />
      </Routes>
  );
};

const LogoutHandler: FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('LogoutHandler mounted');
    logout();
    navigate('/');
  }, [navigate]);

  return null;
};

export default AppRoutes;
