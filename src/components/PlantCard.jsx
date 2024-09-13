import { Card, Image, Text } from '@mantine/core';

const PlantCard = ({
  title,
  description,
  image = "https://images.unsplash.com/photo-1579227114347-15d08fc37cae?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2550&q=80",
  onClickHandler = () => { }
}) => {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        cursor: "pointer"
      }}
      onClick={() => onClickHandler({ title, description, image })}
    >
      <Card.Section>
        <Image
          src={image}
          h={160}
          alt="No way!"
        />
      </Card.Section>

      <Text fw={500} size="lg" mt="md">
        {title}
      </Text>

      <Text mt="xs" c="dimmed" size="sm">
        {description}
      </Text>
    </Card>
  );
}

export default PlantCard;