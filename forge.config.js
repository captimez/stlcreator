const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const { version } = require('html-webpack-plugin');

module.exports = {
  packagerConfig: {
    executableName: "stlcreator",
    icon: "./assets/taskbar",
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
        name: '@electron-forge/maker-zip',
        config: {
          asar: true,
          executableName: 'stlcreator',
          version: '1.1',
          icon: './assets/taskbar',
        },
    }, 
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};