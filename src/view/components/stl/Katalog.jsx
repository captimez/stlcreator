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
                name: "OR-N",
                demoName: "OR-N",
                shortcut: ["D1","D2","A","B","C",""],
                inputs: {
                    aussendurchmesser: 0,
                    laufbahndurchmesser: 0,
                    breite: 0,
                },
            },
            {
                name: "OR-NU",
                demoName: "OR-NU",
                shortcut: ["D1","D2","A","B","C",""],
                inputs: {
                    aussendurchmesser: 0,
                    schulterdurchmesser: 0,
                    laufbahndurchmesser: 0,
                    lichteweite: 0,
                    breite: 0,
                },
            },
            {
                name: "IR-N",
                demoName: "IR-N",
                shortcut: ["D1","D2","A","B"],
                inputs: {
                    innendurchmesser: 0,
                    laufbahndurchmesser: 0,
                    schulterdurchmesser: 0,
                    breite: 0,
                }
            },
            {
                name: "IR-NJ",
                demoName: "IR-NJ",
                shortcut: ["SD","D2","A","B"],
                inputs: {
                    innendurchmesser: 0,
                    laufbahndurchmesser: 0,
                    schulterdurchmesser: 0,
                    breite: 0,
                }
            },
            {
                name: "IR-NJP",
                demoName: "IR-NJP",
                shortcut: ["D1","D2","A","B"],
                inputs: {
                    innendurchmesser: 0,
                    laufbahndurchmesser: 0,
                    breite: 0,
                }
            },
            {
                name: "IR-NU",
                demoName: "IR-NU",
                shortcut: ["D1","D2","A","B"],
                inputs: {
                    innendurchmesser: 0,
                    laufbahndurchmesser: 0,
                    breite: 0,
                }
            },
            {
                name: "IR-NUP",
                demoName: "IR-NUP",
                shortcut: ["D1","D2","A","B"],
                inputs: {
                    innendurchmesser: 0,
                    laufbahndurchmesser: 0,
                    schulterdurchmesser: 0,
                    breite: 0,
                }
            },
        ]
     },
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
