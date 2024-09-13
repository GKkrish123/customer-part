import React from 'react';
import { MantineProvider, AppShell, Loader, Box, Group, Burger, Text, Avatar } from '@mantine/core';
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import NavBar from './NavBar';
import CustomLoader from './Loader';
import { useAuth } from '../auth/authContext';

const ThemeProvider = ({ children }) => {
    // Manage light/dark mode with local storage
    const [colorScheme, _] = useLocalStorage({
        key: 'mantine-color-scheme',
        defaultValue: 'light',
        getInitialValueInEffect: true,
    });

    const { isAppLoading } = useAuth();
    const [opened, { toggle }] = useDisclosure();

    return (
        <MantineProvider
            theme={{
                colorScheme,
                fontFamily: 'Inter, sans-serif',
                primaryColor: 'blue',
                components: {
                    Button: {
                        styles: (theme) => ({
                            root: {
                                borderRadius: theme.radius.md,
                                fontSize: theme.fontSizes.md,
                            },
                        }),
                    },
                    Loader: Loader.extend({
                        defaultProps: {
                            loaders: { ...Loader.defaultLoaders, custom: CustomLoader },
                            type: 'custom',
                        },
                    }),
                },
            }}
            withGlobalStyles
            withNormalizeCSS
        >
            <AppShell
                padding="md"
                header={{
                    height: 50,
                    children: (
                        <Group position="apart" style={{ height: '100%' }}>
                            <Burger
                                opened={opened}
                                onClick={toggle}
                                hiddenFrom="sm"
                                size="sm"
                            />
                            <Text>Logo</Text>
                        </Group>
                    ),
                }}
                navbar={{
                    width: 80,
                    breakpoint: 'sm',
                    collapsed: { mobile: !opened },
                }}
            >
                <AppShell.Header>
                    <Burger
                        opened={opened}
                        onClick={toggle}
                        hiddenFrom="sm"
                        size="sm"
                    />
                    <Avatar src="mantine.png" alt="it's me" />
                </AppShell.Header>

                <AppShell.Navbar p="md">
                    <NavBar />
                </AppShell.Navbar>
                <AppShell.Main>
                    {isAppLoading && <Box style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.7)', zIndex: 9999 }}>
                        <Loader size="xl" />
                    </Box>}
                    {children}
                </AppShell.Main>
            </AppShell>
        </MantineProvider>
    );
};

export default ThemeProvider;
