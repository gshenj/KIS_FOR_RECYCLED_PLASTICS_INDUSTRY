let {app, BrowserWindow, ipcMain} = require('electron');  // Module to control application life.
const logger = require('electron-timber');

// Report crashes to our server.
//require('crash-reporter').start();

if(require('electron-squirrel-startup')) app.quit()//return;

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
    createLoginWindow()
})

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        show: false,
        //frame:false,
        //backgroundColor: '#2e2c29',
        autoHideMenuBar: true
    })

    mainWindow.loadURL('file://' + __dirname + '/pages/index.html')
    mainWindow.once('ready-to-show', () => {
        //mainWindow.show()
    })

    mainWindow.on('maximize', function (e) {
        mainWindow.webContents.executeJavaScript('afterMax()', true)
            .then((result) => {
                console.log(result) // Will be the JSON object from the fetch call
            })
    })
    mainWindow.on('unmaximize', function () {
        mainWindow.webContents.executeJavaScript('afterUnMax()', true)
            .then((result) => {
                console.log(result) // Will be the JSON object from the fetch call
            })
    })

    mainWindow.on('close', function(){
        logger.log('close stop')
        //event.preventDefault()
    })

    mainWindow.on('closed', () => {
        mainWindow = null;
    })
}







function createLoginWindow() {
    loginWindow = new BrowserWindow({
        width: 410,
        height: 280,
        maximizable: false,
        resizable: false,
        minimizable: false,
        frame:false,
        autoHideMenuBar: true,
        show: false
    })

    loginWindow.loadURL('file://' + __dirname + '/pages/login.html')
    loginWindow.once('ready-to-show', () => {
        //loginWindow.show()
    })

    loginWindow.on('closed', () => {
        loginWindow = null
    })
}


ipcMain.on('main-window-ready', (event, arg) =>{
    if(loginWindow) {
        loginWindow.close()
    }
    //mainWindow.maximize()
    mainWindow.show()
    event.returnValue = null;
    logger.log("on main-window-ready")
})

// 登录成功消息
ipcMain.on('login-success', (event, arg) => {
    createMainWindow()
    event.returnValue = null;
    logger.log("login-success.")
})

// 退出登录消息
ipcMain.on('logout', (event, arg) => {
    createLoginWindow()
    mainWindow.close()
    event.returnValue = null
})

