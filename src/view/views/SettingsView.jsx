import React, { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import { Button, Typography, TextField } from '@mui/material';
import { FormControl, FormLabel } from '@mui/material';

const SettingsView = () => {
    const [saveFolder, setSaveFolder] = useState("");

    // Load initial save folder on mount
    useEffect(() => {
        window.api.getSaveFolder().then(setSaveFolder);
    }, []);

    // Open folder dialog
    const handleSelectFolder = async () => {
        const selectedFolder = await window.api.selectFolder();
        if (selectedFolder) {
            setSaveFolder(selectedFolder); // Update UI with new path
        }
    };

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
                        </FormControl>
                    </Box>
                </Box>
            </div>
        </div>
    );
};

export default SettingsView;
