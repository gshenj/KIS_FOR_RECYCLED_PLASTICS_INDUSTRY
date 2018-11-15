var {app, BrowserWindow, ipcMain} = require('electron');  // Module to control application life.
//var BrowserWindow = require('electron').browser-window;  // Module to create native browser window.

// Report crashes to our server.
//require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
var mainWindow = null;
var loginWindow = null;

// 在主进程里

global.globalObj = {
    order: {},
    config:{}
};


// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
        app.quit();
    }
});

var session = {};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
    // Create the browser window.
    createMainWindow()
    showLoginWindow()
});

function createMainWindow(){
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 750,
        show: false,
        backgroundColor: '#2e2c29',
        autoHideMenuBar: true//,
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    mainWindow.loadURL('file://' + __dirname + '/index1.html');
}

function showLoginWindow() {
    loginWindow = new BrowserWindow({
        width: 410,
        height: 280,
        maximizable:false,
        resizable:false,
        minimizable:false,
        show: false,
        title:'系统登录',
        autoHideMenuBar: true
    })
    loginWindow.loadURL('file://' + __dirname + '/login.html');
    loginWindow.on('closed', function () {
        loginWindow = null;
    });

    //loginWindow.show();
}

ipcMain.on('set-config', (event, arg) => {
    global["config"] = arg
    console.log("set config. "+JSON.stringify(arg))
    event.returnValue = null;
})

ipcMain.on('set-order', (event, arg) => {
    global["order"] = arg
    console.log("set order."+JSON.stringify(arg))
    event.returnValue = null;
})


// 登录成功
ipcMain.on('login-success', (event, arg) => {
    console.log("on login-success.")
    mainWindow.show()
    loginWindow.close()
    event.returnValue = null;
});

ipcMain.on('logout', (event, arg) => {
    mainWindow.hide()
    mainWindow.loadURL('file://' + __dirname + '/index1.html')
    mainWindow.setSize(1000, 750)
    showLoginWindow()
    event.returnValue = null;
})

ipcMain.on('app-quit', (event, arg) => {
    console.log("app-quite message.")
    if (mainWindow) {
        mainWindow.close()
    }

    if (loginWindow) {
        loginWindow.close()
    }

    if (process.platform != 'darwin') {
        app.quit();
    }

    event.returnValue = null;
})


// 遮罩层通过ipc来控制
// In main process.
//var ipc = require('ipc');
var win = null;
//这个方法创建窗口，没用
ipcMain.on('show_print_win', function (event, arg) {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true
    });
    win.show();
    win.loadURL('file://' + __dirname + '/' + arg.url);
    win.on('closed', function () {
        win = null;
    });

    event.returnValue = true;
});

ipcMain.on('hide_print_win', function (event, arg) {
    console.log("arg")
    console.log(arg)

    //mainWindow.webContents.executeJavaScript('hide_overlay('+arg+')');
    mainWindow.webContents.send('hide_overlay', arg);

    // ipc2.sendSync("hide_overlay", {})
    //event.sender.send("hide_overlay", {})
    event.returnValue = true;
});


ipcMain.on('jump_to_list', function (event, arg) {
    mainWindow.loadURL('file://' + __dirname + arg.url);
    event.returnValue = true;
});

/*ipc.on('hide_main_window', function(event,arg) {
    //mainWindow.hide();
    mainWindow.setDocumentEdited(false);
    event.returnValue = true;
});

ipc.on('show_main_window', function(event,arg) {
    mainWindow.show();
    event.returnValue = true;
});*/


ipcMain.on('session', function (event, arg) {  // arg->{opt:'', key:'', value:''}
    var opt = arg.opt;
    if (opt == 'get') {
        // console.log('get')

        var ret = session[arg.key];
        //  console.log('ret'+ret)
        if (typeof(ret) == 'undefined')
            event.returnValue = 'undefined';
        else
            event.returnValue = ret;
    } else if (opt == 'put') {
        session[arg.key] = arg.value;
        event.returnValue = true;

    } else if (opt == 'remove') {
        var bln = false;
//  86         try {
//  87             for (var k in session) {
//  88                 if (session[k] == arg.key) {
//  89                     this.elements.splice(i, 1);
//  90                     return true;
//  91                 }
//  92             }
//  93         } catch (e) {
//  94             bln = false;
//  95         }
//  96
        event.returnValue = bln;
    } else if (opt == 'clear') {
        session = {};
        event.returnValue = 'true';
    }
});
