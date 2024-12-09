import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { useAppContext } from '../../../model/store';
import { ListItemAvatar, ListItemButton, ListItemText,Avatar,IconButton } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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

    const { selectedBauteil, setSelectedBauteil } = useAppContext();

    const handleBauteilSelect = (bauteil,index) => {
        setSelectedBauteil(bauteil);
    }


    return (
        <List sx={{ bgcolor: 'background.paper' }}>
            {bauteile.map((teil, index) => (
                 <ListItem
                    selected={selectedBauteil?.name === teil.name}
                    key={index}
                    secondaryAction={
                    <IconButton edge="end" aria-label="select" onClick={() => handleBauteilSelect(teil,index)}>
                        <ArrowForwardIosIcon></ArrowForwardIosIcon>
                    </IconButton>
                    }
               >
                        <ListItemAvatar>
                            <Avatar>
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                        primary={teil.name}
                        />
              </ListItem>
            ))}
        </List>
    );
};

export default Katalog;
