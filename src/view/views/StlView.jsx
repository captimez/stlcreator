import * as React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Katalog from '../components/stl/Katalog';


const StlView = () => {
    return(
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={5}>
                <Grid size={7}>
                    <Katalog></Katalog>
                </Grid>
                <Grid size={5} sx={{backgroundColor:"#88888"}}>
                </Grid>
            </Grid>
        </Box>
    )
}

export default StlView;