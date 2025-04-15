const { app, Menu, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { dialog } = require('electron');

const { preload } = require('react-dom');

if (require('electron-squirrel-startup')) app.quit();

let mainWindow;
const preloadPath = path.join(__dirname, 'preload.js');
const configPath = path.join(app.getPath("userData"), "config.json");
console.log(configPath)
//app.disableHardwareAcceleration();

app.on('ready', () => {
    
    Menu.setApplicationMenu(null);
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        show: true,
        frame: false,
        title: "STL Creator",
        icon: path.join(__dirname, "../assets/taskbar.png"),
        webPreferences: {
            sandbox: false,
            preload: preloadPath, // Preload-Skript
        },
    });
    const startURL = `file://${path.join(__dirname,"../dist/index.html")}`
    console.log("loading: ",startURL)
    mainWindow.webContents.openDevTools({ mode: "detach" });

    mainWindow.loadURL(startURL).catch((err) =>{
        console.error("Failed to load index.html: ", err)
    } );
    mainWindow.webContents.on("did-fail-load",(event, errorCode, errorDescription) =>{
            console.error("Error loading index.html:", errorDescription)
    } )

    mainWindow.on('maximize', () => {
        mainWindow.webContents.send("window_maximized");
    });
    mainWindow.on('unmaximize', () => {
        mainWindow.webContents.send("window_unmaximized");
    });
});

function loadConfig() {
    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if(!config.resolution){
            config.resolution = 30;
        }
        return config;
    }

    return { 
        stlSavePath: app.getPath("documents"),
        resolution: 30,
     }; // Default path
}

function saveConfig(newPath, newResolution, solutionId,dimensions) {
    const config = loadConfig();

    if(newPath){
        config.stlSavePath = newPath;
    }
    if(newResolution){
        config.resolution = newResolution;
    }
    if(solutionId){
        config.solutionId = solutionId;
    }
    if(dimensions){
        config.dimensions = dimensions;
    }
    fs.writeFileSync(configPath, JSON.stringify(config), 'utf-8');
}

ipcMain.handle("save-python-config", (event, outputPath, data) => {
    const settingsConfig = loadConfig();
    const pythonConfig = JSON.parse(data);
    
    pythonConfig.stlSavePath = settingsConfig.stlSavePath;
    pythonConfig.solutionId = settingsConfig.solutionId;

    fs.writeFileSync(outputPath, JSON.stringify(pythonConfig), 'utf-8');
    return true;

})

ipcMain.handle("update-resolution", (event, newResolution) => {
    saveConfig(null, newResolution);
    return loadConfig();
});

ipcMain.handle("update-solution-id", (event, solutionId) => {
    saveConfig(null, null, solutionId);
    return loadConfig();
});

ipcMain.handle("get-solution-id", () => {
    return loadConfig().solutionId;
});

ipcMain.handle("get-resolution", () => {
    return loadConfig().resolution;
});

ipcMain.handle("update-dimensions", (event, dimensions) => {
    saveConfig(null,null,null,dimensions);
    return loadConfig()
});

ipcMain.handle("get-dimensions", (event) => {
    return loadConfig().dimensions;
});

ipcMain.handle("select-folder", async () => {
    const result = await dialog.showOpenDialog({
        title: "Select STL Save Folder",
        properties: ["openDirectory"]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        saveConfig(result.filePaths[0]); // Save selected directory
        return result.filePaths[0]; // Return new path to renderer
    }
    return null; // User canceled selection
});

// 📌 Provide current save path to the renderer
ipcMain.handle("get-save-folder", () => {
    return loadConfig().stlSavePath;
});

ipcMain.handle("get-app-path", (event, name) => {
    return app.getPath(name);
})

ipcMain.handle("window_maximize", () => {
    if(mainWindow.isMaximized()){
        mainWindow.unmaximize();
    }else{
        mainWindow.maximize();
    }
});

ipcMain.handle("window_isMaximized", () => {
    return mainWindow.isMaximized();
});

ipcMain.handle("window_close", () => {
    if(mainWindow){
        mainWindow.close();
    }
});

ipcMain.handle("window_minimize", () => {
    if(mainWindow){
        mainWindow.minimize();
    }
});



