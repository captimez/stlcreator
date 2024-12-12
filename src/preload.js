const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs')
const path = require('path');


ipcRenderer.send("testing", { test: "test"})

console.log("preload skript geladen!")

contextBridge.exposeInMainWorld('api', {
    test: () => ipcRenderer.send("testing", {test: "data"}),
    saveSTL: async (outputPath,data) => {
        try{

            fs.mkdirSync(path.dirname(outputPath),{ recursive: true })
            fs.writeFileSync(outputPath,data)

        }catch(error){
            console.log(error)
        }
        
    },
});
