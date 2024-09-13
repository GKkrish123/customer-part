import React, { useState } from 'react';
import { Box, ScrollArea, Group, Text, Flex, NavLink, Stack } from '@mantine/core';
import withAuth from '../auth/withAuth';
import PartsSearch from '../components/PartsSearch';
import { IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
const navItems = [
    'RM Receiving Inspection Report',
    'Shearing & Heat and Upset Cup End Ball End',
    'Ball OD Grinding',
    'Body Hardening',
    'Induction Hardening Both End',
    'Tempering',
    'Straightening',
    'Polishing',
    'Tumbling',
    'Straightening',
    'Crack Inspection',
    'Final Inspection',
    'Pre Delivery Inspection Report',
    'Layout Inspection',
    'Oiling & Packing',
    'Pre Shipment Audit Inspection',
];
const Parts = () => {
    const [partValue, setPartValue] = useState('');
    const navigate = useNavigate();
    const onPartChange = (part) => {
        setPartValue(part)
    }

    return (
        <Flex
            justify="center"
            align="center"
            direction="column"
            gap="20px"
        >
            <PartsSearch
                value={partValue}
                onChangeHandler={onPartChange}
                data={["test123", "test234"]}
            />

            {partValue &&
                <Stack
                    style={{
                        width: "40%"
                    }}
                    align="stretch"
                    justify="center"
                    gap="10px"
                >
                    {navItems.map((item, index) => (
                        <NavLink
                            component="button"
                            key={item}
                            label={item}
                            rightSection={<IconChevronRight size="1rem" stroke={1.5} />}
                            onClick={() => navigate("/spreadsheet")}
                            variant="subtle"
                            active
                        />
                    ))}
                </Stack>
            }
        </Flex>
    );
};

export default withAuth(Parts);
