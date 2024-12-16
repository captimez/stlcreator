import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { useAppContext } from '../../../model/store';
import { ListItemAvatar, ListItemButton, ListItemText,Avatar,IconButton } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Height } from '@mui/icons-material';

const bauteile = [
    {
        name: "Aussenring1",
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
        inputs: {
            innendurchmesser_klein: 0,
            innendurchmesser_gross: 0,
            aussendurchmesser: 0,
            hoehe: 0,
        }
    },
    {
        name: "Innenring1",
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
        inputs: {
            innendurchmesser: 0,
            aussendurchmesser: 0,
            hoehe: 0,
            radius_ausstich: 0,
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
                            <Avatar src={"images/" + teil.name + ".png"} sx={{ mr: 5, height: 80, width:80,}}>
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
