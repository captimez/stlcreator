import * as React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Katalog from '../components/stl/Katalog';
import { WidthFull, WidthWide } from '@mui/icons-material';
import { AppProvider as CustomProvider, useAppContext } from "./../../model/store";
import BauteilInput from '../components/stl/BauteilInput';

const StlView = () => {

    const { selectedBauteil } = useAppContext();

    return (
        <div style={{ width: "100%", display: "flex" }}>
            <div style={{ width: "20%", borderRight: "1px solid #ddd" }}>
                    <Katalog />
                
            </div>
            <div style={{ width: "80%", marginLeft:"30px" }}>
                    <BauteilInput></BauteilInput>
            </div>
        </div>
    );
};


export default StlView;