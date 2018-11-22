let {app, BrowserWindow, ipcMain, dialog} = require('electron');  // Module to control application life.
//var BrowserWindow = require('electron').browser-window;  // Module to create native browser window.

// Report crashes to our server.
//require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
let mainWindow = null;
let loginWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
        app.quit();
    }
})


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
    // Create the browser window.
    createLoginWindow()
})

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        show: false,
        frame:false,
        backgroundColor: '#2e2c29',
        autoHideMenuBar: true
    })

    mainWindow.loadURL('file://' + __dirname + '/index1.html')

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.on('closed', () => {
        mainWindow = null;
    })
}

function createLoginWindow() {
    loginWindow = new BrowserWindow({
        width: 410,
        height: 280,
       // maximizable: false,
       // resizable: false,
        minimizable: false,
        frame:false,
        show: false,
        autoHideMenuBar: true
    })


    loginWindow.loadURL('file://' + __dirname + '/login.html')

    loginWindow.once('ready-to-show', () => {
        loginWindow.show()
    })

    loginWindow.on('closed', () => {
        loginWindow = null
    })
}


// 登录成功消息
ipcMain.on('login-success', (event, arg) => {
    console.log("login-success.")
    createMainWindow()
    loginWindow.close()
    event.returnValue = null;
})

// 退出登录消息
ipcMain.on('logout', (event, arg) => {
    createLoginWindow()
    mainWindow.close()
    event.returnValue = null
})
