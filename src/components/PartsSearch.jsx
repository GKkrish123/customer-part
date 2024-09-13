import { Autocomplete } from '@mantine/core';

const PartsSearch = ({data, value, onChangeHandler}) => {
    return (
        <Autocomplete
            label="Search with Part No."
            placeholder="Pick value or enter something"
            data={data}
            value={value}
            style={{
                maxWidth: "400px",
                width: "100%"
            }}
            onChange={onChangeHandler}
        />
    );
}

export default PartsSearch;