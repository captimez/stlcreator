const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const spawner = require('child_process').spawn;
const { start } = require('repl');

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
    saveJsonConfig: async (outputPath, data) => {
        try {
            // Erstelle das Verzeichnis, falls es nicht existiert
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });

            // Schreibe die Daten in die Datei
            fs.writeFileSync(outputPath, data);
        } catch (error) {
            console.log(error);
        }
    },
    startPythonScript: async (scriptName, args) => {
        try {
            const scriptPath = path.join(__dirname, `../${scriptName}`);
            const python = spawner('python', [scriptPath, []]);
            python.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });
            python.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
            python.on('close', (code) => {
                console.log(`child process exited with code ${code}`);
            });
        } catch (error) {
            console.log(error);
        }
    },
    getPath: (name) => ipcRenderer.invoke("get-app-path",name),
    selectFolder: () => ipcRenderer.invoke("select-folder"),
    getSaveFolder: () => ipcRenderer.invoke("get-save-folder"),
    
});
