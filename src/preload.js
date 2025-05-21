const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const { send } = require('process');
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
           throw error; // Fehler werfen, damit er im Aufrufer behandelt werden kann
        }
    },
    updatedStl: async () => ipcRenderer.invoke("updated-stl"),
    onStlUpdate: (callback) => ipcRenderer.on("stl-update", (_,data) => callback(data)),
    removeStlUpdateListeners: () => ipcRenderer.removeAllListeners("stl-update"),
    savePythonConfig: async (outputPath, data) => ipcRenderer.invoke("save-python-config", outputPath, data),
    startPythonScript: (scriptName) => ipcRenderer.invoke("start-python-script", scriptName, []),
    onStlUpdate:(callback) => ipcRenderer.on("stl-update", (_,data) => callback(data)),
    onUpdateInfo: (callback) => ipcRenderer.handle("update-info", callback),
    onPythonOutput: (callback) => ipcRenderer.on("python-output", (_,data) => callback(data)),
    onPythonError: (callback) => ipcRenderer.on("python-error", (_,data) => callback(data)),
    removeUpdateInfoListeners: () => ipcRenderer.removeAllListeners("update-info"),
    updateVerschiebung: (verschiebung) => ipcRenderer.invoke("update-verschiebung", verschiebung),
    updateDimensions: (dimensions) => ipcRenderer.invoke("update-dimensions", dimensions),
    getDimensions: () => ipcRenderer.invoke("get-dimensions"),
    getPath: (name) => ipcRenderer.invoke("get-app-path",name),
    selectFolder: () => ipcRenderer.invoke("select-folder"),
    getSaveFolder: () => ipcRenderer.invoke("get-save-folder"),
    updateResolution: (resolution) => ipcRenderer.invoke("update-resolution", resolution),
    getResolution: () => ipcRenderer.invoke("get-resolution"),
    getSolutionId: () => ipcRenderer.invoke("get-solution-id"),
    updateSolutionId: (solutionId) => ipcRenderer.invoke("update-solution-id", solutionId),
    minimizeWindow: () => ipcRenderer.invoke("window_minimize"),
    closeWindow: () => ipcRenderer.invoke("window_close"),
    maximizeWindow: () => ipcRenderer.invoke("window_maximize"),
    isMaximized: () => ipcRenderer.invoke("window_isMaximized"),
    onMaximized: (callback) => ipcRenderer.on("window_maximized", callback),
    onUnmaximized: (callback) => ipcRenderer.on("window_unmaximized", callback), 
    sendDimensionsToSps: (aussendurchmesser, innendurchmesser, hoehe) => ipcRenderer.invoke("send-dimensions-to-sps", aussendurchmesser, innendurchmesser, hoehe),
});
