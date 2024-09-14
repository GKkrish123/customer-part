import React from 'react';
import { Box, Group, Text, ThemeIcon, Menu, Divider, ScrollArea } from '@mantine/core';
import { IconSettings, IconHome, IconLogout, IconTools } from '@tabler/icons-react';
import { useAuth } from '../auth/authContext';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
    const { logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const navItems = [
        { icon: IconHome, label: 'Plants', to: "/plants" },
        { icon: IconTools, label: 'Parts', to: "/parts" },
    ];

    const handleLogout = () => {
        logout();
    };

    const onNavItemClicked = (data) => {
        navigate(data.to);
    }

    return (
        <>
            {/* Logo and name */}
            <Box>
                <Group justify='center'>
                    <Text
                        size="xl"
                        fw={900}
                        variant="gradient"
                        gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                    >App</Text>
                </Group>
            </Box>

            {isAuthenticated && <><Divider my="md" />

                <ScrollArea style={{ height: 'calc(100vh - 200px)' }}>
                    {navItems.map((item) => (
                        <Group key={item.label} mb="md" justify='center'>
                            <ThemeIcon variant="light" size="lg" style={{
                                cursor: "pointer"
                            }} onClick={() => onNavItemClicked(item)}>
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
                        <Group justify='center'>
                            <ThemeIcon variant="light" size="lg" style={{
                                cursor: "pointer"
                            }}>
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
            }
        </>
    );
};

export default NavBar;
