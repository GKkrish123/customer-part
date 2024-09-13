import React from 'react';
import { useAuth } from './authContext'; // Import the context hook
import { Navigate } from 'react-router-dom'; // For redirection

// Higher-Order Component (HOC) for protecting routes
const withAuth = (Component) => {
  return (props) => {
    const { isAuthenticated, isAppLoading } = useAuth(); // Check authentication state

    if (!isAuthenticated && !isAppLoading) {
      // Redirect to login page if not authenticated
      return <Navigate to="/login" />;
    }

    // Render the protected component if authenticated
    return <Component {...props} />;
  };
};

export default withAuth;
