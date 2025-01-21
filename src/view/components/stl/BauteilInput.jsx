import * as React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import { Refresh, WidthFull, WidthWide } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import TextField from '@mui/material/TextField';
import { useAppContext } from '../../../model/store';
import './bauteilInput.css'
import Grid2 from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import {createSTL} from '../../../service/openjscad'
import { create } from '@mui/material/styles/createTransitions';
import MyThree from '../threejs/viewer';
import { IconButton, Modal } from '@mui/material';
import Typography from '@mui/material/Typography';

const BauteilInput = () => {

    const { selectedBauteil, setSelectedBauteil } = useAppContext();
    const [open, setOpen] = React.useState(false);
    const [imageSrc, setImageSrc] = React.useState(null);

    const handleInputChange = (key, value) => {
        setSelectedBauteil({
            ...selectedBauteil,
            inputs: {
                ...selectedBauteil.inputs,
                [key]: Number(value),
            },
        });
    };

    const showImagePopup = (imageName) => {
        setImageSrc(`images/${imageName}`);
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
        setImageSrc(null);
    }

    const handleCreateSTL = async () => {
        try{

            console.log(selectedBauteil.inputs)

            await createSTL(selectedBauteil)
        }catch(error){
            console.log(error);
        }
    }

    if (!selectedBauteil?.inputs) {
        return <p>No Bauteil selected</p>;
    }

    return (
        <Box id="boxbox" sx={{ flexGrow: 1, p:2}}>
            <div id="bauteilInputs">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ mb: 0}}  variant="h5" gutterBottom>
                        {selectedBauteil.name}
                    </Typography>
                    <IconButton onClick={() => showImagePopup(`${selectedBauteil.name}_info.png`)}><InfoIcon /></IconButton>
                </Box>
                <Grid2 container spacing={{xs:2, md:3 }} columns={{ xs:4, sm:8, md: 12}}>
                    {Object.entries(selectedBauteil?.inputs).map(([key,value,index]) =>{
                        return (
                            <Grid2 key={key}>
                                
                                <div className="input-box" key={key}>
                                    
                                    <TextField disabled={ key === 'winkel' ? false : false } name={key}  type='number'  id="outlined-basic" label={key} variant="outlined" size='small'
                                     onChange={(e) => {handleInputChange(key, e.target.value)}}/>
                                </div>
                            </Grid2>
                    )
                    })}
                </Grid2>
            </div>
                <Button sx={{ mt:1.5}} variant="contained" onClick={() => handleCreateSTL()}>Create STL</Button>
                <MyThree style={{width: "100%"}} name={selectedBauteil.name}></MyThree>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="image-popup-title"
                    aria-describedby="image-popup-description"
                >
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                        <Typography id="image-popup-title" variant="h6" component="h2">
                           { selectedBauteil?.name }
                        </Typography>
                        {imageSrc && <img src={imageSrc} alt="Popup" style={{ width: '100%' }} />}
                    </Box>
                </Modal>
        </Box>
    );
};


export default BauteilInput;