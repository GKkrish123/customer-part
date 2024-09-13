import React from 'react';
import { Box, Group, Text, ThemeIcon, Menu, Divider, ScrollArea, Paper } from '@mantine/core';
import { IconSettings, IconHome, IconUser, IconLogout } from '@tabler/icons-react';
import { useAuth } from '../auth/authContext';

const NavBar = () => {
    const { logout } = useAuth(); // Check authentication state
  const navItems = [
    { icon: IconHome, label: 'Home' },
    { icon: IconUser, label: 'Profile' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Logo and name */}
      <Box mb="md">
        <Group position="apart">
          <Text size="xl" weight={700}>MyApp</Text>
          <Text size="sm">Page Name</Text>
        </Group>
      </Box>

      <Divider my="md" />

      {/* Navigation items */}
      <ScrollArea style={{ height: 'calc(100vh - 200px)' }}>
        {navItems.map((item) => (
          <Group key={item.label} mb="md">
            <ThemeIcon variant="light" size="lg">
              <item.icon size={20} />
            </ThemeIcon>
            <Text>{item.label}</Text>
          </Group>
        ))}
      </ScrollArea>

      <Divider my="md" />

      {/* Settings Menu */}
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Group>
            <ThemeIcon variant="light" size="lg">
              <IconSettings size={20} />
            </ThemeIcon>
            <Text>Settings</Text>
          </Group>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item icon={<IconSettings size={14} />}>Account Settings</Menu.Item>
          <Menu.Item icon={<IconLogout size={14} />} onClick={handleLogout} color="red">
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
};

export default NavBar;
