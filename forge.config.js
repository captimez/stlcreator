const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const { version } = require('html-webpack-plugin');

module.exports = {
  packagerConfig: {
    executableName: "stlcreator",
    icon: "./assets/taskbar",
    asar: false
  },
  rebuildConfig: {},
  makers: [
    {
        name: '@electron-forge/maker-zip',
        config: {
          asar: true,
          executableName: 'stlcreator',
          version: '1.2',
          icon: './assets/taskbar',
        },
    }, 
  ],
  plugins: [
    
  ],
};