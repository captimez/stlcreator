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
// Load initial save folder on mount
useEffect(() => {
    window.api.getSaveFolder().then(setSaveFolder);
    window.api.getResolution().then(setResolution); 
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

return (
    <div style={{ height:"100%", width: "100%", display: "flex" }}>
        <div style={{ width: "40%", marginLeft:"30px" }}>
            <Box sx={{ mt: 2, ml: 2 }}>
                <Typography sx={{mb:2, color: "#757575", fontWeight: 700}} variant='h5'>Settings</Typography>
                <Box sx={{ ml: 2 }}>
                    <FormControl style={{ marginBottom: "10px", width: "100%" }}>
                        <FormLabel>STL Files Directory</FormLabel>
                        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                            <TextField 
                                id="directory" 
                                value={saveFolder} 
                                size='small' 
                                label="Directory"
                            />
                            <Button sx={{p:1}} variant='contained' size="small" onClick={handleSelectFolder} >Select</Button>
                        </Box>
                        <FormLabel sx={{ mt: 1}}>STL Render Resolution</FormLabel>
                        <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
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
                    </FormControl>
                </Box>
            </Box>
        </div>
    </div>
);
};

export default SettingsView;













