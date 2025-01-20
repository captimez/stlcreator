import * as React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Katalog from '../components/stl/Katalog';
import { WidthFull, WidthWide } from '@mui/icons-material';
import { AppProvider as CustomProvider, useAppContext } from "./../../model/store";
import BauteilInput from '../components/stl/BauteilInput';

const TrainView = () => {

    const { selectedBauteil } = useAppContext();

    return (
        <div style={{ height:"100%", width: "100%", display: "flex" }}>
            <div style={{ width: "20%", borderRight: "1px solid #ddd" }}>
                    TREESDFDSF
                
            </div>
            <div style={{ width: "80%", marginLeft:"30px" }}>
                    SDFSDFSDFSDf
            </div>
        </div>
    );
};


export default TrainView;