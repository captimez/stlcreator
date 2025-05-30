import * as React from 'react';
import Grid2 from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import { CheckBox, Info as InfoIcon } from '@mui/icons-material';
import TextField from '@mui/material/TextField';
import { useAppContext } from '../../../model/store';
import './bauteilInput.css';
import Button from '@mui/material/Button';
import { createSTL } from '../../../service/openjscad';
import MyThree from '../threejs/viewer';
import { IconButton, Modal, Typography } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';

/**
 * BauteilInput Komponente
 * 
 * Diese Komponente zeigt Eingabefelder für ein ausgewähltes Bauteil an und ermöglicht die Erstellung einer STL-Datei basierend auf den Eingaben.
 * Zusätzlich enthält sie eine 3D-Vorschau und ein modales Fenster zur Anzeige von Bauteilbildern.
 */
const BauteilInput = () => {
    // Zugriff auf das aktuell ausgewählte Bauteil aus dem globalen Zustand
    const { selectedBauteil, setSelectedBauteil } = useAppContext();
    const { showSnackbar } = useAppContext(); // Zugriff auf die Snackbar-Funktion
    const [open, setOpen] = React.useState(false); // Zustand für das Modal
    const [imageSrc, setImageSrc] = React.useState(null); // Zustand für das Bild im Modal

    /**
     * Aktualisiert die Eingabewerte des ausgewählten Bauteils im Zustand.
     * 
     * @param {string} key - Der Schlüssel des Eingabewertes
     * @param {number} value - Der neue Wert
     */
    const handleInputChange = (key, value) => {
        setSelectedBauteil({
            ...selectedBauteil,
            inputs: {
                ...selectedBauteil.inputs,
                [key]: Number(value),
            },
        });
    };

    /**
     * Öffnet das Bild-Popup und setzt das Bild basierend auf dem Bauteilnamen.
     * 
     * @param {string} imageName - Der Name des Bildes
     */
    const showImagePopup = (imageName) => {
        setImageSrc(`images/${imageName}`);
        setOpen(true);
    };

    /**
     * Schließt das Bild-Popup.
     */
    const handleClose = () => {
        setOpen(false);
        setImageSrc(null);
    };

    /**
     * Erstellt eine STL-Datei für das aktuell ausgewählte Bauteil.
     * 
     * Ruft die createSTL-Funktion aus dem OpenJSCAD-Service auf.
     */
    const handleCreateSTL = async () => {
        try {
            console.log(selectedBauteil);
           const response = await createSTL(selectedBauteil);
           if(response){
             showSnackbar("STL-Datei erfolgreich erstellt", "success");
             window.api.updatedStl(); // Aktualisiert die STL-Datei im Hauptprozess
           }

        } catch (error) {
            showSnackbar(`Fehler beim Erstellen der STL-Datei \n ${error} `, "error");
        }
    };

    // Falls kein Bauteil ausgewählt ist, zeige eine Meldung an
    if (!selectedBauteil?.inputs) {
        return <p>No Bauteil selected</p>;
    }

    return (
        <Box id="boxbox" sx={{ flexGrow: 1, p: 1 }}>
            <div id="bauteilInputs">
                {/* Titel mit Bauteilnamen und Info-Button */}
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ mt: 1, fontWeight: 700, color: "#757575" }} variant="h5" gutterBottom>
                        {selectedBauteil.name}
                    </Typography>
                    <IconButton onClick={() => showImagePopup(`${selectedBauteil.name}_info.png`)}>
                        <InfoIcon />
                    </IconButton>
                </Box>
                {/* Dynamische Eingabefelder für die Bauteilparameter */}
                <Grid2 container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    {Object.entries(selectedBauteil?.inputs).map(([key, value], index) => {
                        const shortcut = selectedBauteil?.shortcut?.[index] || '';
                        return key !== "half" ? (
                            <Grid2 key={key}>
                                <div className="input-box">
                                    <TextField
                                        name={key}
                                        type='number'
                                        label={`${key}${shortcut ? ` (${shortcut})` : ''}`}
                                        variant="filled"
                                        slotProps={{
                                            input: { sx: { color: 'black' } },
                                            inputLabel: { style: { color: '#000' } } // Setzt die Label-Farbe auf Schwarz
                                        }}
                                        size='small'
                                        onChange={(e) => handleInputChange(key, e.target.value)}
                                    />
                                </div>
                            </Grid2>
                        ) : (
                            <Grid2 key={key}>
                                <div className="input-box" style={{ display: 'flex', alignItems: 'center' }}>
                                    <Checkbox
                                        checked={!!selectedBauteil.inputs[key]}
                                        onChange={(e) => handleInputChange(key, e.target.checked ? 1 : 0)}
                                    />
                                    <Typography sx={{ ml: 1 }}>Halbieren</Typography>
                                </div>
                            </Grid2>
                        );
                    })}
                </Grid2>
            </div>
            <Grid2 sx={{mt:2}} container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}> {/* ✅ Use same column width as other inputs */}
                <Grid2>
                    <div class="input-box">
                        <TextField
                            id="outlined-basic"
                            label="STL-Dateiname"
                            variant="filled"
                            size="small"
                            onChange={(event) => setSelectedBauteil({ ...selectedBauteil, stlName: event.target.value })}
                            style={{ width: "100%" }} 
                        />
                    </div>
                </Grid2>
                <Grid2>
                    <div class="input-box">
                        <Button sx={{ mt: 1.5 }} variant="contained" onClick={handleCreateSTL}>
                            Erstelle STL
                        </Button>
                    </div>
                </Grid2>
            </Grid2>

            {/* 3D-Vorschau Komponente */}
            <MyThree key={selectedBauteil.demoName} style={{ width: "100%" }} name={selectedBauteil.demoName} />

            {/* Modal für das Bauteil-Info-Bild */}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="image-popup-title"
                aria-describedby="image-popup-description"
            >
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                    <Typography id="image-popup-title" variant="h6" component="h2">
                        {selectedBauteil?.name}
                    </Typography>
                    {imageSrc && <img src={imageSrc} alt="Popup" style={{ width: '100%' }} />}
                </Box>
            </Modal>
        </Box>
    );
};

export default BauteilInput;
