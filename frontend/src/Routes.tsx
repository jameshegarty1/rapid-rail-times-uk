import React, { FC, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Admin } from 'admin';
import { useNavigate } from 'react-router';
import Home from 'components/Home';
import Login from 'components/Login';
import SignUp from 'components/SignUp';
import ProfileList from 'components/ProfileList';
import { logout } from 'utils/auth';

export default function AppRoutes() {
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
        <Route path="/logout" element={<LogoutHandler />} />
      </Routes>
  );
}

const LogoutHandler: FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('LogoutHandler mounted');
    logout();
    navigate('/');
  }, [navigate]);

  return null;
};
