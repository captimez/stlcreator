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
    const [ isChecked, setIsChecked ] = useState({Rohr: false, LStueck: false, TStueck: false});
    const [solutionName, setSolutionName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [copySolutionId, setCopySolutionId] = useState('');

    const [aussendurchmesser, setAussendurchmesser] = useState(0);
    const [innendurchmesser, setInnendurchmesser] = useState(0);
    const [rohrdurchmesser, setRohrdurchmesser] = useState(0);
    const [hoehe, setHoehe] = useState(0);
    const [laenge, setLaenge] = useState(0);
    const [radius, setRadius] = useState(0);
    const [rohrlaenge, setRohrlaenge]= useState(0);
    const [thoehe, setThoehe] = useState(0);
    const [gp_count, setGpCount] = useState(0);

    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('test');

    useEffect(() => {
        window.api.getDimensions().then((dimensions) => {
            
            console.log("Dimensions loaded: ", dimensions);
            setRohrdurchmesser(dimensions.rohrdurchmesser);
            setAussendurchmesser(dimensions.aussendurchmesser);
            setInnendurchmesser(dimensions.innendurchmesser);
            setRohrlaenge(dimensions.rohrlaenge);
            setRadius(dimensions.radius);
            setHoehe(dimensions.hoehe);
            setLaenge(dimensions.laenge);
            setThoehe(dimensions.thoehe);

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
        const newCheckedState = {Rohr: false, LStueck: false, TStueck: false, [event.target.name]: true };
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
            copySolutionId: copySolutionId,
            selectedFile: selectedFile.name,
            type: type,
            aussendurchmesser: aussendurchmesser,
            innendurchmesser: innendurchmesser,
            hoehe: hoehe,
            laenge: laenge,
            thoehe: thoehe,
            radius: radius,
            rohrdurchmesser: rohrdurchmesser,
            rohrlaenge: rohrlaenge,
            gp_count: gp_count
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
                                <TextField id="standard-basic"  onChange={(event) => setSolutionName(event.target.value)}  size='small' />
                            </FormControl>
                            <FormControl style={{ marginBottom: "10py"}}>
                                <FormLabel>Copy Solution ID</FormLabel>
                                <TextField id="standard-basic" onChange={(event) => setCopySolutionId(event.target.value)} size='small'/>
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
                                    onChange={(event) => {
                                        setSelectedFile(event.target.files[0]);
                                    }}
                                    accept=".stl"
                                    multiple
                                />
                                </Button>
                                {selectedFile && (
                                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                        Ausgewählte Datei: {selectedFile.name}
                                    </Typography>
                                )}
                            </FormControl>
                            <FormControlLabel control={<Checkbox name='LStueck' checked={isChecked.LStueck} color="primary" onChange={handleCheckboxChange}/>} label="LStueck" />
                            <FormControlLabel control={<Checkbox name='TStueck' color="primary" checked={isChecked.TStueck} onChange={handleCheckboxChange}/>} label="TStueck" />
                            <FormControlLabel control={<Checkbox name='Rohr' color="primary" checked={isChecked.Rohr} onChange={handleCheckboxChange}/>} label="Rohr" />
                            {
                                isChecked.Rohr && (
                                    <FormControl  style={{ marginBottom: "10px" }}>
                                        <FormLabel>Länge</FormLabel>
                                        <TextField id="standard-basic" value={rohrlaenge} onChange={(event) => setRohrlaenge(Number(event.target.value))} size='small' />
                                    </FormControl>
                                ) ||
                                isChecked.LStueck && (
                                    <FormControl  style={{ marginBottom: "10px" }}>
                                        <FormLabel>Schenkel Länge</FormLabel>
                                        <TextField id="standard-basic" value={laenge} onChange={(event) => setLaenge(Number(event.target.value))} size='small' />
                                        <FormLabel>Schenkel Radius</FormLabel>
                                        <TextField id="standard-basic" value={radius} onChange={(event) => setRadius(Number(event.target.value))} size='small' />
                                    </FormControl>
                                ) ||
                                isChecked.TStueck && (
                                    <FormControl  style={{ marginBottom: "10px" }}>
                                        <FormLabel>Durchmesser Rohr 1</FormLabel>
                                        <TextField id="standard-basic" value={rohrdurchmesser} onChange={(event) => setRohrdurchmesser(Number(event.target.value))} size='small' />
                                        <FormLabel>T-Stück Höhe</FormLabel>
                                        <TextField id="standard-basic" value={thoehe} onChange={(event) => setThoehe(Number(event.target.value))} size='small' />
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