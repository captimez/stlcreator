const { app, Menu, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { preload } = require('react-dom');

if (require('electron-squirrel-startup')) app.quit();

let mainWindow;
const preloadPath = path.join(__dirname, 'preload.js');

app.disableHardwareAcceleration();

app.on('ready', () => {
    
    Menu.setApplicationMenu(null);
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        show: true,
        frame: true,
        title: "STL Creator",
        webPreferences: {
            sandbox: false,
            preload: preloadPath, // Preload-Skript
        },
    });
    const startURL = `file://${path.join(__dirname,"../dist/index.html")}`
    console.log("loading: ",startURL)


    mainWindow.loadURL(startURL).catch((err) =>{
        console.error("Failed to load index.html: ", err)
    } );
    mainWindow.webContents.openDevTools();
    mainWindow.webContents.on("did-fail-load",(event, errorCode, errorDescription) =>{
            console.error("Error loading index.html:", errorDescription)
    } )
});

ipcMain.handle("get-app-path", (event, name) => {
    return app.getPath(name);
})




