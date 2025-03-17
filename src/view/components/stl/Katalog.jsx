import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { useAppContext } from '../../../model/store';
import { ListItemAvatar, ListItemButton, ListItemText,Avatar,IconButton, Collapse, Typography, Box } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Height } from '@mui/icons-material';
import { string } from 'three/tsl';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

//Bauteile definieren
const bauteile = [
    {
            name: "Ringe",
            teile: [
            {
                name: "Aussenring1",
                shortcut: ["D1","D2","A","B","C",""],
                inputs: {
                    aussendurchmesser: 0,
                    innendurchmesser: 0,
                    hoehe: 0,
                    breite_aussen: 0,
                    breite_innen: 0,
                    tiefe_innen: 0,
            }
            },
            {
                name: "Aussenring2",
                shortcut: ["D1","D2","D3","A"],
                inputs: {
                    innendurchmesser_klein: 0,
                    innendurchmesser_gross: 0,
                    aussendurchmesser: 0,
                    hoehe: 0,
                }
            },
            {
                name: "Innenring1",
                shortcut: ["D1","D2","D3","D4","D5","A","B","C"],
                inputs: {
                    durchmesser_or: 0,
                    durchmesser_so: 0,
                    durchmesser_su: 0,
                    durchmesser_ur: 0,
                    innendurchmesser: 0,
                    hoehe_or: 0,
                    hoehe: 0,
                    hoehe_ur: 0,
                }
            },
            {
                name: "Innenring2",
                shortcut: ["D1","D2","A","B"],
                inputs: {
                    innendurchmesser: 0,
                    aussendurchmesser: 0,
                    hoehe: 0,
                    radius_ausstich: 0,
                }
            },]
     },
    {
        name:"T-Stuecke",
        teile: [
            {
                name: "T-Stueck",
                shortcut: ["AD1","AD2","",""],
                inputs:{
                    zylinder_duchmesser_aussen: 0,
                    zylinder2_durchmesser_aussen: 0,
                    laenge: 0,
                    hoehe: 0,
                }
            },]},
    {
        name:"Winkel",
        teile: [
            {
                name: "Rohrbogen",
                shortcut: ["DM","W","SL1","SL2"],
                inputs:{
                    durchmesser: 20,
                    winkel: 90,
                    schenkel_laenge_1: 60,
                    schenkel_laenge_2: 60,
                }
            },
    ]}
    
];

/**
 * Katalog-Komponente
 * 
 * Diese Komponente zeigt eine Liste von Bauteilkategorien, die ein- und ausgeklappt werden können.
 * Jedes Bauteil kann ausgewählt werden und wird im globalen Zustand (`useAppContext`) gespeichert.
 */
const Katalog = () => {
    const { selectedBauteil, setSelectedBauteil } = useAppContext();
    const [katalogOpen, setKatalogOpen] = React.useState(new Map());

    /**
     * Öffnet oder schließt eine Bauteilkategorie.
     * @param {Object} key - Die Kategorie, die geöffnet oder geschlossen werden soll.
     */
    const handleOpen = (key) => {
        const newKatalogOpen = new Map(katalogOpen);
        newKatalogOpen.set(key, !newKatalogOpen.get(key));
        setKatalogOpen(newKatalogOpen);
    };

    /**
     * Setzt das ausgewählte Bauteil im globalen Zustand.
     * @param {Object} bauteil - Das ausgewählte Bauteil.
     */
    const handleBauteilSelect = (bauteil) => {
        setSelectedBauteil(bauteil);
    };

    // Setzt standardmäßig "Aussenring1" als ausgewähltes Bauteil beim ersten Rendern
    React.useEffect(() => {
        const defaultBauteil = bauteile.flatMap(reiter => reiter.teile).find(bauteil => bauteil.name === "Aussenring1");
        if (defaultBauteil) {
            setSelectedBauteil(defaultBauteil);
        }
    }, [setSelectedBauteil]);

    return (
        <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <Typography sx={{ ml:1, mt: 2, mb: 0, color:"#757575", fontWeight: 700, fontSize: 12 }}>Katalog</Typography>
            <List sx={{ bgcolor: 'background.paper' }}>
                {bauteile.map((reiter, index) => (
                    <div key={index}>
                        {/* Kategorie-Listenelement mit Expand/Collapse-Button */}
                        <ListItem
                            secondaryAction={
                                <IconButton edge="end" aria-label="expand" onClick={() => handleOpen(reiter)}>
                                    {katalogOpen.get(reiter) ? <ExpandLess /> : <ExpandMore />}  
                                </IconButton>
                            }
                        >
                            <ListItemText primary={reiter.name} />
                        </ListItem>

                        {/* Collapsible List für die Bauteile in der Kategorie */}
                        <Collapse in={katalogOpen.get(reiter)} timeout="auto">
                            <List>
                                {reiter.teile.map((bauteil, index) => (
                                    <ListItem key={index}>
                                        <ListItemAvatar>
                                            <Avatar src={`images/${bauteil.name}.png`} sx={{ mr: 3, height: 40, width: 40 }} />
                                        </ListItemAvatar>
                                        <ListItemText primary={bauteil.name} />
                                        <IconButton edge="end" aria-label="select" onClick={() => handleBauteilSelect(bauteil)}>
                                            <ArrowForwardIosIcon sx={{ height: 20, width: 20 }} /> 
                                        </IconButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Collapse>
                    </div>
                ))}
            </List>
        </Box>
    );
};

export default Katalog;
