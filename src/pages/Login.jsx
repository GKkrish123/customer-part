import React, { useState } from 'react';
import { TextInput, PasswordInput, Button, Group, Box, Text, Paper, Title, Image } from '@mantine/core';
import { useAuth } from '../auth/authContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth(); // Access login function from context
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (username && password) {
      // Simulate login, normally you'd validate against an API
      const isLoggedIn = login(username, password);
      if (isLoggedIn) navigate('/');
      else setError('Incorrect username or password!');
    } else {
      setError('Please fill in both fields.');
    }
  };

  return (
    <Box
      sx={(theme) => ({
        maxWidth: 400,
        margin: 'auto',
        paddingTop: theme.spacing.xl,
      })}
    >
      <Paper shadow="md" p="xl" radius="md">
        {/* Logo */}
        <Group position="center" mb="xl">
          <Image src="mantine.png" alt="Logo" width={80} height={80} />
        </Group>

        {/* Title */}
        <Title align="center" order={2} mb="md">
          Welcome to MyApp
        </Title>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <TextInput
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            mb="sm"
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            mb="md"
          />

          {error && (
            <Text color="red" size="sm" mb="md">
              {error}
            </Text>
          )}

          <Group position="center">
            <Button type="submit" fullWidth>
              Login
            </Button>
          </Group>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
