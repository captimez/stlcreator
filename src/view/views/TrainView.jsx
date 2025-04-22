import React, { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import { AppProvider as CustomProvider, useAppContext } from "./../../model/store";
import { Checkbox, Input, FormControlLabel, FormGroup, FormControl, FormLabel } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Button, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';

const TrainView = () => {
    // Initialize state for isSymmetric
    const [isSymmetric, setIsSymmetric] = useState(false);
    const { selectedBauteil } = useAppContext();
    const [ isChecked, setIsChecked ] = useState({Ring: false, Winkel: false, TStueck: false});
    const [solutionName, setSolutionName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [aussendurchmesser, setAussendurchmesser] = useState(0);
    const [innendurchmesser, setInnendurchmesser] = useState(0);
    const [hoehe, setHoehe] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('test');

    useEffect(() => {
        window.api.getDimensions().then((dimensions) => {
            
            console.log("Dimensions loaded: ", dimensions);

            setAussendurchmesser(dimensions.aussendurchmesser);
            setInnendurchmesser(dimensions.innendurchmesser);
            setHoehe(dimensions.hoehe);

        });
        window.api.onPythonOutput((output) => {
            setProgress(output.percentage);
            setMessage(output.message);
            console.log("Python Output: ", output);
        });
        window.api.onPythonError((error) => {
            setProgress(0);
            setMessage("Python Error: " + error);
            console.error("Python Error: ", error);
        });
    }, []);

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
            aussendurchmesser: aussendurchmesser,
            innendurchmesser: innendurchmesser,
            hoehe: hoehe,
        };
        
        console.log(selectedFile.name)
        await window.api.savePythonConfig('pythonConfig.json', JSON.stringify(config));
        await window.api.startPythonScript('script.py');

        setIsLoading(true);
        setProgress(0);
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
                            {
                                isChecked.Ring && (
                                    <FormControl  style={{ marginBottom: "10px" }}>
                                        <FormLabel>Aussendurchmesser</FormLabel>
                                        <TextField id="standard-basic" value={aussendurchmesser} onChange={(event) => setAussendurchmesser(event.target.value)} size='small' label="Aussendurchmesser" />
                                        <FormLabel>Innendurchmesser</FormLabel>
                                        <TextField id="standard-basic" value={innendurchmesser} onChange={(event) => setInnendurchmesser(event.target.value)} size='small' label="Innendurchmesser" />
                                        <FormLabel>Höhe</FormLabel>
                                        <TextField id="standard-basic" value={hoehe} onChange={(event) => setHoehe(event.target.value)} size='small' label="Hoehe" />
                                    </FormControl>
                                )
                            }
                        </FormGroup> 
                        <Button variant='contained' onClick={handleSubmit} sx={{ mt: 2 }}>Einlernen</Button>
                        {isLoading && (
                            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', mt: 2 }}>
                                <Box sx={{ width: '100%', mr: 1 }}>
                                    <LinearProgress variant="determinate" value={progress || 0} />
                                </Box>
                                <Box sx={{ minWidth: 35, mt: 1 }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {`${progress || 0}%`}
                                    </Typography>
                                </Box>
                                
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                        {message}
                                    </Typography>
                            </Box>
                        )}
                   </Box> 
            </div>
        </div>
    );
};

export default TrainView;