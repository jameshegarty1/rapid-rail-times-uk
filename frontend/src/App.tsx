import React, { useEffect } from 'react';
import AppRoutes from './Routes';

export default function App() {
  useEffect(() => {
    document.title = "Rail Times UK";
  }, []);
  return <AppRoutes />;
}
