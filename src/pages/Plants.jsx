import React from 'react';
import { Flex } from '@mantine/core';
import { useAuth } from '../auth/authContext';
import { useNavigate } from 'react-router-dom';
import PlantCard from '../components/PlantCard';
import withAuth from '../auth/withAuth';

const Plants = () => {
    const navigate = useNavigate();

    const plantsList = [
        {
            title: "G16",
            description: "This is a G16 branch",
            image: "G16.webp"
        },
        {
            title: "Ponneri",
            description: "This is a Ponneri branch",
            image: "Ponneri.jpg"
        }
    ]

    const onPlantClicked = (plantData) => {
        navigate("/parts");
    }

    return (
        <Flex
            justify="center"
            gap="10px"
        >
            {plantsList.map((plantProps, index) => <PlantCard key={index} {...plantProps} onClickHandler={onPlantClicked} />)}
        </Flex>
    );
};

export default withAuth(Plants);
