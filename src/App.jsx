import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/authContext';
import withAuth from './auth/withAuth';
import Login from './pages/Login';
import SpreadSheet from './components/SpreadSheet';
import ThemeProvider from './components/ThemeProvider';
import 'handsontable/dist/handsontable.full.min.css';
import '@mantine/core/styles.css';

const App = () => {
  return (
      <AuthProvider>
    <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* <Route path="/" element={<Home />} /> */}
            <Route path="/" element={<SpreadSheet />} />
          </Routes>
        </Router>
    </ThemeProvider>
      </AuthProvider>
  );
};

export default App;
