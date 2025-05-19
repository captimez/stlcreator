import React, { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import { Button, Typography, TextField } from '@mui/material';
import { FormControl, FormLabel } from '@mui/material';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';
import { styled } from '@mui/material/styles';

const SettingsView = () => {
const [saveFolder, setSaveFolder] = useState("");
const [resolution, setResolution] = useState(null);
const [solution_id, setSolutionId] = useState(1);
const [opcuaStatus, setOpcuaStatus] = useState("");

// Load initial save folder on mount
useEffect(() => {
    window.api.getSaveFolder().then(setSaveFolder);
    window.api.getResolution().then(setResolution); 
    window.api.getSolutionId().then(setSolutionId); // Load initial solution ID
}, []);

const Input = styled(MuiInput)`
  width: 42px;
`;

// Open folder dialog
const handleSelectFolder = async () => {
    const selectedFolder = await window.api.selectFolder();
    if (selectedFolder) {
        setSaveFolder(selectedFolder); // Update UI with new path
    }
};

const handleUpdateResolution = () => {
    window.api.updateResolution(resolution).then(() => {
        setResolution(resolution); // Update UI with new resolution
    });
}

const handleCheckOpcuaConnection = async () => {
    const result = await window.api.checkOpcuaConnection();
    console.log(result)
    setOpcuaStatus(result.message);
};

return (
    <div style={{ height:"100%", width: "100%", display: "flex" }}>
        <div style={{ width: "40%", marginLeft:"30px" }}>
            <Box sx={{ mt: 2, ml: 2 }}>
                <Typography sx={{mb:2, color: "#757575", fontWeight: 700}} variant='h5'>Einstellungen</Typography>
                <Box sx={{ ml: 2 }}>
                    <FormControl style={{ marginBottom: "10px", width: "100%" }}>
                        <FormLabel>STL Verzeichnis</FormLabel>
                        <Box sx={{ display: "flex", alignItems: "center", mt: 1, mb: 1 }}>
                            <TextField 
                                id="directory" 
                                value={saveFolder} 
                                size='small' 
                                label="Directory"
                            />
                            <Button sx={{p:1}} variant='contained' size="small" onClick={handleSelectFolder} >Select</Button>
                        </Box>
                        <FormLabel sx={{ mt: 1}}>STL Render Auflösung</FormLabel>
                        <Box sx={{ display: "flex", alignItems: "center", mt: 2, mb: 1 }}>
                            <Slider
                                value={resolution}
                                sx={{ml:1, mr: 2 }}
                                onChange={(e, newValue) => { setResolution(newValue); }}
                                onChangeCommitted={(e, newValue) => window.api.updateResolution(newValue)}
                                aria-labelledby="input-slider"
                                min={1}
                                max={100}
                                />
                            <Input
                                type="number"
                                id="resolution" 
                                value={resolution}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    setResolution(value);
                                    window.api.updateResolution(value);
                                }} 
                                size='small' 
                                label="Resolution"
                            />

                        </Box>
                        <FormLabel sx={{ mt: 1}}>BPS COPY Solution ID</FormLabel>
                        <Box sx={{ display: "flex", alignItems: "center", mt: 2, mb: 1 }}>
                            <Input type="number"
                                min={1} max={100} id="solution-id" 
                                value={solution_id} 
                                onChange={(e) => { 
                                    setSolutionId(e.target.value)
                                    window.api.updateSolutionId(e.target.value)
                                    }} 
                                size='small' 
                                label="BPS COPY Solution ID" 
                            />
                        </Box>
                        <Box sx = {{ display: "flex", alignItems: "center", mt: 2, mb: 1 }}>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleCheckOpcuaConnection}
                                style={{ marginTop: "20px" }}
                            >
                                Check OPC UA Connection
                            </Button>
                            {opcuaStatus && (
                                <Typography sx={{ mt: 2, color: opcuaStatus.includes("successfully") ? "green" : "red" }}>
                                    {opcuaStatus}
                                </Typography>
                            )}
                        </Box>
                    </FormControl>
                </Box>
            </Box>
        </div>
    </div>
);
};

export default SettingsView;












