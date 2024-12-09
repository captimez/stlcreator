import * as React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import { WidthFull, WidthWide } from '@mui/icons-material';
import TextField from '@mui/material/TextField';
import { useAppContext } from '../../../model/store';
import './bauteilInput.css'
import Grid2 from '@mui/material/Grid2';

const BauteilInput = () => {

    const { selectedBauteil, setSelectedBauteil } = useAppContext();


    const handleInputChange = (key, value) => {
        setSelectedBauteil({
            ...selectedBauteil,
            inputs: {
                ...selectedBauteil.inputs,
                [key]: value,
            },
        });
    };

    if (!selectedBauteil?.inputs) {
        return <p>No Bauteil selected</p>;
    }

    return (
        <Box sx={{ flexGrow: 1, p:2 }}>
                <Grid2 container spacing={{xs:2, md:3 }} columns={{ xs:4, sm:8, md: 12}}>
                    {Object.entries(selectedBauteil?.inputs).map(([key,value,index]) =>{
                        return (
                            <Grid2>
                                <div class="input-box">
                                    <label class="input-label" htmlFor={key}>{key}</label>
                                    <TextField  name={key}  type='number'  id="outlined-basic" label={key} variant="outlined" size='small'/>
                                </div>
                            </Grid2>
                    )
                    })}
                </Grid2>
        </Box>
    );
};


export default BauteilInput;