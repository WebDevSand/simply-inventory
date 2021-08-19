const {app, BrowserWindow, ipcMain, Menu} = require('electron');
const path = require('path');
const appPath = app.getAppPath();
const fs = require('fs');

var win;
var dialogWindow;
var paramsMain;
var version;
var userPath = app.getPath('userData');

// Menu
const menuTemplate = [{
    label: 'File',
    submenu: [{role: 'close',label: 'Exit'}]
    },
    {
       label: 'Edit',
       submenu: [{role: 'copy'},{role: 'paste'}]
    },
    {
       label: 'View',
       submenu: [{role: 'reload'},{type: 'separator'},{role: 'togglefullscreen'},
                // {role: 'toggledevtools'}
                ]
    },
    {
       role: 'window',
       submenu: [{role: 'minimize'}]
    },
    {
       role: 'help',
       submenu: [{label: 'About Simple Inventory',
                click: ()=>{
                    showAboutDialog();
                }}]
    }
];  
 
const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

app.on('ready', ()=>{

    // ****************
    // Test script begins
    // let usersModule = require('./src/modules/usersModule.js');
    // usersModule.getPermissions(1, (err, result)=>{
    //     console.log(result);
    // });
    // Test script ends
    // ****************

    // Load version
    try {
        version = fs.readFileSync(path.join(appPath,'src', 'misc', 'version'))
                        .toString();
    } catch(e) {
        console.log('Version file corrupted! Exiting...')
        app.quit();
    }

    // Check if running for first time
    let userSettingsPath = path.join(userPath, 'misc');
    if(!fs.existsSync(userSettingsPath)) {
        console.log('Creating dir: '+userSettingsPath);
        fs.mkdirSync(userSettingsPath);
    }

    // Load userSettings
    let userSettings;
    try {
        userSettings = fs.readFileSync(path.join(userPath,'misc','userSettings'));
        userSettings = JSON.parse(userSettings);
    } catch(e) {
        userSettings = {
                            sessionURL: 'http://localhost/',
                            db: '',
                            fontSize: 14
                        };
    }
    userSettings.version = version;
    // Write usersettings to file
    fs.writeFileSync(path.join(userPath,'misc','userSettings'), JSON.stringify(userSettings));
    global.userSettings = userSettings;
    console.log('New global variable saved...');
    console.log(global.userSettings);

    win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadFile(path.join(appPath,'src','html','login.html'));

    win.webContents.on('crashed', (e) => {
        console.log(e);
    });

    // win.webContents.openDevTools();
});

// MacOS - app will stay open unless Cmd+Q
app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        app.quit();
    }
});

// MacOS - Dock icon clicked and no windows opened
app.on('activate', ()=>{
    if(BrowserWindow.getAllWinows().length === 0) {
        createWindow();
    }
});

ipcMain.on('save-global-user-settings', (event, userSettings)=>{
    console.log('Saving global variable userSettings');
    console.log(userSettings);
    global.userSettings = userSettings;
    fs.writeFileSync(path.join(userPath, 'misc', 'userSettings'), JSON.stringify(userSettings));
    event.returnValue = true;
});

ipcMain.on('redirect-window', (event, fileName, params)=>{
    paramsMain = params;
    win.loadURL('file://'+path.join(appPath, 'src', 'html', fileName));
});

ipcMain.on('variable-request', function (event, arg) {
    event.sender.send('variable-reply', paramsMain);
});

ipcMain.on('open-new-window', (event, fileName, params, width, height) => {
    if(!dialogWindow) {
        dialogWindow = new BrowserWindow({
            width:800, 
            height:600, 
            webPreferences: {
                nodeIntegration:true,
                additionalArguments: params
            }
        });
        dialogWindow.setMenuBarVisibility(false);
    }
    try {
        dialogWindow.loadURL('file://'+path.join(appPath, 'src', 'html', fileName));
    } catch(e) {
        dialogWindow = new BrowserWindow({
            width:800, 
            height:600, 
            webPreferences: {
                nodeIntegration:true,
                additionalArguments: params
            }
        });
        dialogWindow.setMenuBarVisibility(false);
        dialogWindow.loadURL('file://'+path.join(appPath, 'src', 'html', fileName));
    }
    dialogWindow.setAlwaysOnTop(true);

    dialogWindow.on('close', ()=>{
        win.reload();
    })
});

ipcMain.on('error-in-window', function(event, data) {
    console.log(data);
});

function showAboutDialog() {
    const aboutDialog = new BrowserWindow({
        width: 600,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });
    aboutDialog.loadURL('file://'+path.join(appPath, 'src', 'html', 'aboutDialog.html'));
    aboutDialog.setMenuBarVisibility(false);
    aboutDialog.setAlwaysOnTop(true);
}

ipcMain.on('print-window-pdf', function(event, fileName, arg) {

    let exportPath = path.join(app.getPath('home'), 'SimpleInventory');
    if(!fs.existsSync(exportPath)) {
        fs.mkdirSync(exportPath);
    }
    exportPath = path.join(exportPath, 'exports');
    if(!fs.existsSync(exportPath)) {
        fs.mkdirSync(exportPath);
    }
    
    dialogWindow.webContents.printToPDF({}).then(data => {
        exportPath += '/'+fileName;
        fs.writeFileSync(exportPath, data);
        event.sender.send('print-window-pdf-reply', exportPath);
    });
});

ipcMain.on('print-window', function(event, arg) {
    // let printers = dialogWindow.webContents.getPrinters();
    // console.log(printers);

    dialogWindow.setAlwaysOnTop(false);
    const options = { silent: false }
    let printSuccess = true;
    let error = '';
    dialogWindow.webContents.print(options, (success, errorType) => {
        if (!success) {
            error = errorType;
            printSuccess = false;
        }

        dialogWindow.setAlwaysOnTop(true);
        event.sender.send('print-window-reply', {success: printSuccess, error: error});
    })
});