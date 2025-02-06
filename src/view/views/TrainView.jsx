import * as React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Katalog from '../components/stl/Katalog';
import { Label, WidthFull, WidthWide } from '@mui/icons-material';
import { AppProvider as CustomProvider, useAppContext } from "./../../model/store";
import BauteilInput from '../components/stl/BauteilInput';
import { Checkbox, Input } from '@mui/material';
import { Button, Typography } from '@mui/material';

const TrainView = () => {
    // Initialize state for isSymmetric
    const [isSymmetric, setIsSymmetric] = React.useState(false);
    const { selectedBauteil } = useAppContext();

    return (
        <div style={{ height:"100%", width: "100%", display: "flex" }}>
            <div style={{ width: "80%", marginLeft:"30px" }}>
                   <Box sx={{ mt: 2, ml: 2 }}>    
                        <Typography variant='h5'>Einlern Tool</Typography>
                        <Label sx={{ mt: 2 }}></Label> 
                        <Checkbox checked={isSymmetric} onChange={(e) => setIsSymmetric(e.target.checked)} sx={{ mt: 2 }}>Symmetrisch</Checkbox>
                        <Button variant='contained' sx={{ mt: 2 }}>Neue Einlernung</Button>
                   </Box> 
            </div>
        </div>
    );
};


export default TrainView;