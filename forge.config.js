const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    executableName: "stlcreator",
    icon: "./assets/taskbar",
    asar: false, 
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      config: {
        asar: false, 
        executableName: 'stlcreator',
        version: '1.3.2',
        icon: './assets/taskbar',
      },
    }, 
  ],
  plugins: [
  ],
};
