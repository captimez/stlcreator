import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { useAppContext } from '../../../model/store';
import { ListItemAvatar, ListItemButton, ListItemText,Avatar,IconButton, Collapse } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Height } from '@mui/icons-material';
import { string } from 'three/tsl';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const bauteile = [
    {
            name: "Ringe",
            teile: [
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
            },]
     },
    {
        name:"T-Stuecke",
        teile: [
            {
                name: "T-Stueck",
                inputs:{
                    zylinder_duchmesser_aussen: 0,
                    zylinder_duchmesser_innen: 0,
                    zylinder2_durchmesser_aussen: 0,
                    zylinder2_duchemsser_innen: 0,
                    laenge: 0,
                    hoehe: 0,
                }
            },]},
    {
        name:"Winkel",
        teile: [
            {
                name: "Rohrbogen",
                inputs:{
                    durchmesser: 20,
                    winkel: 90,
                    schenkel_laenge_1: 60,
                    schenkel_laenge_2: 60,
                }
            },
    ]}
    
];

const Katalog = () => {

    const { selectedBauteil, setSelectedBauteil } = useAppContext();

    const [open, setOpen] = React.useState(true);

    const handleOpen = () => {
        setOpen(!open);
    };

    const handleBauteilSelect = (bauteil,index) => {
        setSelectedBauteil(bauteil);
    }


    return (
        <List sx={{ bgcolor: 'background.paper' }}>
            {bauteile.map((reiter, index) => (
                <div>
                <ListItem
                    
                    key={index}
                    secondaryAction={
                    <IconButton  edge="end" aria-label="select" onClick={handleOpen}>
                        {open ? <ExpandLess /> : <ExpandMore />}  
                    </IconButton>
                    
                    }
               >

                        <ListItemText
                        primary={reiter.name}
                        />
                        
              </ListItem>
                <Collapse in={open} timeout="auto">
                        <List>
                            {reiter.teile.map((bauteil,index) => (
                                <ListItem key={index}
                                    secondaryAction={
                                        <IconButton  edge="end" aria-label="select" onClick={() => handleBauteilSelect(bauteil,index)}>
                                            <ArrowForwardIosIcon sx={{ height:20, width: 20}}></ArrowForwardIosIcon> 
                                        </IconButton>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar src={"images/" + bauteil.name + ".png"} sx={{ mr: 3, height: 40, width:40,}}>
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                            primary={bauteil.name}
                                    />
                                </ListItem>
                                ))
                            }
                        </List>
                </Collapse>
            </div>
            ))}
            
        </List>
    );
};

export default Katalog;
