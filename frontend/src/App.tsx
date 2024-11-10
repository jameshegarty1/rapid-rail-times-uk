import React from 'react';
import AppRoutes from 'Routes';

console.log('Environment variables:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
});

export default function App() {
  return <AppRoutes />;
}
