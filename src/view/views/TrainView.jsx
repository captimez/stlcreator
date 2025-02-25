import * as React from 'react';
import Box from '@mui/material/Box';
import { AppProvider as CustomProvider, useAppContext } from "./../../model/store";
import { Checkbox, Input, FormControlLabel, FormGroup, FormControl, FormLabel } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';

const TrainView = () => {
    // Initialize state for isSymmetric
    const [isSymmetric, setIsSymmetric] = React.useState(false);
    const { selectedBauteil } = useAppContext();

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    return (
        <div style={{ height:"100%", width: "100%", display: "flex" }}>
            <div style={{ width: "40%", marginLeft:"30px" }}>
                   <Box sx={{ mt: 2, ml: 2 }}>    
                    
                        <Typography sx={{mb:2}} variant='h5'>Einlern Tool</Typography>
                        <FormGroup>
                            <FormControl style={{ marginBottom: "10px" }}>
                                <FormLabel>Solution Name</FormLabel>
                                <TextField id="standard-basic" size='small' label="Name" />
                            </FormControl>
                            <FormControl style={{ marginBottom: "10px" }}>
                                <FormLabel>Select STL File</FormLabel>
                                <Button
                                    component="label"
                                    role={undefined}
                                    variant="contained"
                                    tabIndex={-1}
                                    startIcon={<CloudUploadIcon />}
                                >Select File
                                <VisuallyHiddenInput
                                    type="file"
                                    onChange={(event) => console.log(event.target.files)}
                                    multiple
                                />
                                </Button>
                            </FormControl>
                            <FormControlLabel control={<Checkbox defaultChecked color="primary" />} label="Ring" />
                            <FormControlLabel control={<Checkbox color="primary" />} label="Winkel" />
                            <FormControlLabel control={<Checkbox color="blue" />} label="TStueck" />
                        </FormGroup> 
                        <Button variant='contained' sx={{ mt: 2 }}>Neue Einlernung</Button>
                   </Box> 
            </div>
        </div>
    );
};

export default TrainView;