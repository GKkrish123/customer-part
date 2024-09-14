import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state for the auth context
const initialState = {
  isAuthenticated: false,
  isAppLoading: true,
  user: null,
  isAdmin: false,
};

// Reducer function to handle authentication state updates
const authReducer = (state, action) => {  
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    case 'APP_LOADING':
        return {
          ...state,
          isAppLoading: action.payload
        };
    case 'UPDATE_ISADMIN':
        return {
          ...state,
          isAdmin: action.payload
        };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isAdmin: false
      };
    default:
      return state;
  }
};

// Create the context
const AuthContext = createContext();

// Create a custom hook to access the AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component to wrap the app
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Sync state with localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      dispatch({ type: 'LOGIN', payload: JSON.parse(storedUser) });
    }
    setTimeout(() => dispatch({ type: 'APP_LOADING', payload: false }), 1000);
  }, []);

  // Method to handle login
  const login = (username, password) => {
    // Check for specific username and password
    dispatch({ type: 'APP_LOADING', payload: true });
    if (username === 'admin1234' && password === 'pass1234') {
      const userData = { username }; // You can include more user details here
      localStorage.setItem('user', JSON.stringify(userData)); // Store user in localStorage
      dispatch({ type: 'LOGIN', payload: userData });
      dispatch({ type: 'UPDATE_ISADMIN', payload: true });
      setTimeout(() => dispatch({ type: 'APP_LOADING', payload: false }), 1000);
      return true;
    } else if (username === 'user1234' && password === 'pass1234') {
      const userData = { username }; // You can include more user details here
      localStorage.setItem('user', JSON.stringify(userData)); // Store user in localStorage
      dispatch({ type: 'LOGIN', payload: userData });
      dispatch({ type: 'UPDATE_ISADMIN', payload: false });
      setTimeout(() => dispatch({ type: 'APP_LOADING', payload: false }), 1000);
      return true;
    } else {
      console.error('Invalid username or password'); // Handle invalid login attempt
      dispatch({ type: 'UPDATE_ISADMIN', payload: false });
      setTimeout(() => dispatch({ type: 'APP_LOADING', payload: false }), 1000);
      return false;
    }
  };

  // Method to handle logout
  const logout = () => {
    dispatch({ type: 'APP_LOADING', payload: true });
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    setTimeout(() => dispatch({ type: 'APP_LOADING', payload: false }), 1000);
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
