const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Sende eine Testnachricht an den Main-Prozess
ipcRenderer.send("testing", { test: "test" });

console.log("preload skript geladen!");

// Expose a limited API to the renderer process
contextBridge.exposeInMainWorld('api', {
    // Testfunktion, die eine Nachricht an den Main-Prozess sendet
    test: () => ipcRenderer.send("testing", { test: "data" }),

    // Funktion zum Speichern einer STL-Datei
    saveSTL: async (outputPath, data) => {
        try {
            // Erstelle das Verzeichnis, falls es nicht existiert
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });

            // Schreibe die Daten in die Datei
            fs.writeFileSync(outputPath, data);
        } catch (error) {
            console.log(error);
        }
    },
});
