const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { preload } = require('react-dom');

let mainWindow;
const preloadPath = path.join(__dirname, 'preload.js');

app.on('ready', () => {

    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            sandbox: false,
            preload: preloadPath, // Preload-Skript
        },
    });
    mainWindow.loadURL(`file://${path.join(__dirname, '../dist/index.html')}`);
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on("testing", (data) => {
    console.log(data)
})
