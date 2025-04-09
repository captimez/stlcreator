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
    const [ isChecked, setIsChecked ] = React.useState({Ring: false, Winkel: false, TStueck: false});
    const [solutionName, setSolutionName] = React.useState('');
    const [selectedFile, setSelectedFile] = React.useState(null);

    const handleCheckboxChange = (event) => {
        const newCheckedState = { Ring: false, Winkel: false, TStueck: false, [event.target.name]: true };
        setIsChecked(newCheckedState);
        console.log(newCheckedState);
    };

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
    
    const handleSubmit = async() => {
        const type = Object.keys(isChecked).filter(key => isChecked[key]);

        const config = {
            solutionName: solutionName,
            selectedFile: selectedFile.name,
            type: type,
        };
        
        console.log(selectedFile.name)
        await window.api.saveJsonConfig('config.json', JSON.stringify(config));
        await window.api.startPythonScript('script.py');


    }

    return (
        <div style={{ height:"100%", width: "100%", display: "flex" }}>
            <div style={{ width: "40%", marginLeft:"30px" }}>
                   <Box sx={{ mt: 2, ml: 2 }}>    
                    
                        <Typography sx={{mb:2, color: "#757575", fontWeight: 700}} variant='h5'>Einlern Tool</Typography>
                        <FormGroup sx={{ml:2}}>
                            <FormControl style={{ marginBottom: "10px" }}>
                                <FormLabel>Solution Name</FormLabel>
                                <TextField id="standard-basic"  onChange={(event) => setSolutionName(event.target.value)}  size='small' label="Name" />
                            </FormControl>
                            <FormControl style={{ marginBottom: "10px" }}>
                                <FormLabel>Datei Auswahl</FormLabel>
                                <Button
                                    component="label"
                                    role={undefined}
                                    variant="contained"
                                    tabIndex={-1}
                                    startIcon={<CloudUploadIcon />}
                                >Datei auswählen
                                <VisuallyHiddenInput
                                    type="file"
                                    onChange={(event) => setSelectedFile(event.target.files[0])}
                                    accept=".stl"
                                    multiple
                                />
                                </Button>
                            </FormControl>
                            <FormControlLabel control={<Checkbox name='Ring' checked={isChecked.Ring} color="primary" onChange={handleCheckboxChange}/>} label="Ring" />
                            <FormControlLabel control={<Checkbox name='Winkel' checked={isChecked.Winkel} color="primary" onChange={handleCheckboxChange}/>} label="Winkel" />
                            <FormControlLabel control={<Checkbox name='TStueck' color="primary" checked={isChecked.TStueck} onChange={handleCheckboxChange}/>} label="TStueck" />
                        </FormGroup> 
                        <Button variant='contained' onClick={handleSubmit} sx={{ mt: 2 }}>Neue Einlernung</Button>
                   </Box> 
            </div>
        </div>
    );
};

export default TrainView;