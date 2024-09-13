import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/authContext';
import withAuth from './auth/withAuth';
import Login from './pages/Login';
import SpreadSheet from './components/SpreadSheet';
import ThemeProvider from './components/ThemeProvider';
import 'handsontable/dist/handsontable.full.min.css';
import '@mantine/core/styles.css';
import Plants from './pages/Plants';
import Parts from './pages/Parts';

const App = () => {
  return (
      <AuthProvider>
    <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/plants" element={<Plants />} />
            <Route path="/parts" element={<Parts />} />
            <Route path="/spreadsheet" element={<SpreadSheet />} />

            <Route path="*" element={<Navigate to="/plants" replace />} />
          </Routes>
        </Router>
    </ThemeProvider>
      </AuthProvider>
  );
};

export default App;
