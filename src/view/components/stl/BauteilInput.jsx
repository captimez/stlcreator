import * as React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import { Refresh, WidthFull, WidthWide } from '@mui/icons-material';
import TextField from '@mui/material/TextField';
import { useAppContext } from '../../../model/store';
import './bauteilInput.css'
import Grid2 from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import {createSTL} from '../../../service/openjscad'
import { create } from '@mui/material/styles/createTransitions';
import MyThree from '../threejs/viewer';
import { IconButton } from '@mui/material';

const BauteilInput = () => {

    const { selectedBauteil, setSelectedBauteil } = useAppContext();

    const handleInputChange = (key, value) => {
        setSelectedBauteil({
            ...selectedBauteil,
            inputs: {
                ...selectedBauteil.inputs,
                [key]: Number(value),
            },
        });
    };

    const handleCreateSTL = async () => {
        try{

            console.log(selectedBauteil.inputs)

            await createSTL(selectedBauteil)
        }catch(error){
            console.log(error);
        }
    }

    if (!selectedBauteil?.inputs) {
        return <p>No Bauteil selected</p>;
    }

    React.Component.didMou

    return (
        <Box id="boxbox" sx={{ flexGrow: 1, p:2 }}>
                <Grid2 container spacing={{xs:2, md:3 }} columns={{ xs:4, sm:8, md: 12}}>
                    {Object.entries(selectedBauteil?.inputs).map(([key,value,index]) =>{
                        return (
                            <Grid2 key={key}>
                                <div className="input-box" key={key}>
                                    
                                    <TextField  name={key}  type='number'  id="outlined-basic" label={key} variant="outlined" size='small'
                                     onChange={(e) => {handleInputChange(key, e.target.value)}}/>
                                </div>
                            </Grid2>
                    )
                    })}
                </Grid2>
                <Button sx={{ mt:1.5}} variant="contained" onClick={() => handleCreateSTL()}>Create STL</Button>
                <MyThree  name={selectedBauteil.name}></MyThree>
        </Box>
    );
};


export default BauteilInput;