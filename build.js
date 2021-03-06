var electronInstaller = require('electron-winstaller');
var path = require("path");

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: path.join('./build/kis-win32-ia32'), //刚才生成打包文件的路径
    outputDirectory: path.join('./build/out/'), //输出路径
    setupIcon: path.resolve('images/icon_64px.ico'),
    iconUrl: path.resolve('images/icon_64px.ico'),
    loadingGif:path.join('./build/appLoading.gif'),
    authors: 'shenjin', // 作者名称
    exe: 'kis.exe', //在appDirectory寻找exe的名字
    setupExe:'kis-setup.exe',
    noMsi: true
});

resultPromise.then(() => console.log("build ok!"), (e) => console.log(`No dice: ${e.message}`));
