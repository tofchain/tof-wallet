'use strict';
import {app, protocol, BrowserWindow, ipcMain, Menu,ipcRenderer} from 'electron'
import {createProtocol, installVueDevtools} from 'vue-cli-plugin-electron-builder/lib'
import {autoUpdater} from 'electron-updater'

const isDevelopment = process.env.NODE_ENV !== 'production';
let win;
protocol.registerStandardSchemes(['app'], {secure: true});

function createWindow() {

  if (process.platform === 'darwin') {
    const template = [
      {
        label: "Application",
        submenu: [
          {
            label: "Quit", accelerator: "Command+Q", click: function () {
              app.quit();
            }
          }
        ]
      },
      {
        label: "Edit",
        submenu: [
          {label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:"},
          {label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:"},
        ]
      }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  } else {
    Menu.setApplicationMenu(null)
  }

  win = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1300,
    minHeight: 800,
    webPreferences: {webSecurity: false}
  });
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  });
  win.once('ready-to-show', () => {
    win.show()
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
});

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      await installVueDevtools()
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
});

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// ????????????
!function updateHandle() {
  let message = {
    error: {type: 1, info: '??????????????????'},
    checking: {type: 2, info: '????????????????????????'},
    updateAva: {type: 3, info: '???????????????????????????????????????'},
    updateNotAva: {type: 4, info: '????????????????????????????????????????????????'},
  };
  // ??????????????????????????????**.exe
  const uploadUrl = "http://file.wallet.nuls.io/download/main";
  autoUpdater.setFeedURL(uploadUrl);

  autoUpdater.on('error', function (error) {
    console.log(error);
    sendUpdateMessage(message.error)
  });
  autoUpdater.on('checking-for-update', function () {
    sendUpdateMessage(message.checking)
  });
  autoUpdater.on('update-available', function (info) {
    console.log(info);
    sendUpdateMessage(message.updateAva)
  });
  autoUpdater.on('update-not-available', function () {
    sendUpdateMessage(message.updateNotAva)
  });

  // ????????????????????????
  autoUpdater.on('download-progress', function (progressObj) {
    win.webContents.send('downloadProgress', progressObj)
  });
  autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
    /*autoUpdater.on('update-downloaded', function () {*/
    console.log(event);
    console.log(releaseNotes);
    console.log(releaseName);
    console.log(releaseDate);
    console.log(updateUrl);
    console.log(quitAndUpdate);
    /*ipcMain.on('isUpdateNow', () => {*/
    ipcMain.on('isUpdateNow', (e, arg) => {
      console.log(e);
      console.log(arg);
      console.log("????????????");
      //some code here to handle event
      autoUpdater.quitAndInstall();
    });

    win.webContents.send('isUpdateNow')
  });

  ipcMain.on("checkForUpdate", () => {
    //????????????????????????
    autoUpdater.checkForUpdates();
  })
}();

// ??????main?????????????????????renderer???????????????????????????
function sendUpdateMessage(text) {
  win.webContents.send('message', text)
}
