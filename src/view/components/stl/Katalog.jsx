import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { useAppContext } from '../../../model/store';
import { ListItemButton, ListItemText } from '@mui/material';

const bauteile = [
    {
        name: "Außenring1",
        inputs: {
            aussendurchmesser: "",
            innendurchmesser: "",
            hoehe: "",
            breite_aussen: "",
            breite_innen: "",
            tiefe_innen: "",
        }
    },
    {
        name: "Aussenring2",
        inputs: {
            innendurchmesser_klein: "",
            innendurchmesser_gross: "",
            aussendurchmesser: "",
            hoehe: "",
        }
    },
    {
        name: "Innenring1",
        inputs: {
            durchmesser_or: "",
            durchmesser_so: "",
            durchmesser_su: "",
            durchmesser_ur: "",
            innendurchmesser: "",
            hoehe_or: "",
            hoehe: "",
            hoehe_ur: "",
        }
    },
    {
        name: "Innenring2",
        inputs: {
            innendurchmesser: "",
            aussendurchmesser: "",
            hoehe: "",
            radius_ausstich: "",
        }
    }
];

const Katalog = () => {
    const { setSelectedBauteil } = useAppContext();

    return (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {bauteile.map((teil, index) => (
                <ListItem 
                    key={index} 
                    disablePadding
                    sx={{ borderBottom: '1px solid #ddd' }} // Optional: Trennung zwischen Items
                >
                    <ListItemButton onClick={() => setSelectedBauteil(teil)}>
                        <ListItemText primary={teil.name} />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
};

export default Katalog;
