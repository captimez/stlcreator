import * as React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Katalog from '../components/stl/Katalog';
import { WidthFull, WidthWide } from '@mui/icons-material';
import { AppProvider as CustomProvider, useAppContext } from "./../../model/store";
import BauteilInput from '../components/stl/BauteilInput';

/**
 * StlView-Komponente
 * 
 * Diese Komponente stellt die Hauptansicht für das Arbeiten mit STL-Dateien bereit.
 * Sie enthält zwei Hauptbereiche:
 * - Links: Den Katalog zur Auswahl von Bauteilen.
 * - Rechts: Die Eingabemaske für Bauteilparameter.
 */
const StlView = () => {
    // Zugriff auf das aktuell ausgewählte Bauteil aus dem globalen Zustand
    const { selectedBauteil } = useAppContext();

    return (
        <div style={{ height: "100%", width: "100%", display: "flex" }}>
            {/* Linke Sidebar mit dem Katalog zur Auswahl der Bauteile */}
            <div style={{ width: "20%", borderRight: "1px solid #ddd" }}>
                <Katalog />
            </div>
            
            {/* Rechte Hauptansicht mit der Bauteil-Eingabemaske */}
            <div style={{ width: "80%", marginLeft: "30px", marginRight: "30px" }}>
                <BauteilInput />
            </div>
        </div>
    );
};

export default StlView;