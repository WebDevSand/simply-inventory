const md5 = require('md5');
const fs = require('fs');

const {remote, ipcRenderer} = require('electron');
const dialog = remote.dialog;
const session = remote.session;
const app = remote.app;
const path = require('path');
const appPath = app.getAppPath();
const userPath = app.getPath('userData');

const commonModule = require(path.join(appPath,'src','modules','commonModule.js'));
const usersModule = require(path.join(appPath,'src','modules','usersModule.js'));
const dbModule = require(path.join(appPath,'src','modules','dbModule.js'));

var sessionURL = remote.getGlobal('userSettings').sessionURL;
var loginButtonClicked = false;

commonModule.checkLoggedIn((err, user)=>{
    if(err) {
        console.log('Not logged in');
    } else {
        // Already logged in
        ipcRenderer.send('redirect-window', 'index.html', []);
    }
})

$(document).ready(()=>{

    let db = require('electron').remote.getGlobal('userSettings').db;
    let firstTimeUse = false;
    if(!db) {
        // Move skeleton.db from /src/db/skeleton.db to userData folder
        let dbPath = commonModule.getDefaultDBPath();
        dbPath = path.join(dbPath, 'firstDB.db');
        if(!fs.existsSync(dbPath)) {
            console.log('Creating new DB...');
            fs.copyFileSync(path.join(appPath, 'src', 'db', 'skeleton.db'), dbPath);
            console.log('New DB file copied to: '+dbPath);
        }
        $('#db').val(dbPath);

        // First time instructions
        $('#firstTimeInstructions').html(`<b>Welcome to Simple Inventory!</b><br />We realize that you are using 
            this installation of Simple Inventory for the first time. 
            <br /><br />Please login using <b>admin / pass@1234</b><br />
            <br />Default database: <b>${dbPath}</b>
            <br /><br />
            Also, please note that by using this software, you are in agreement with our End User License Agreement: <a href="#" class="link" onclick="openExternal('https://www.orangetreesoft.com/simple_inventory/eula')">https://www.orangetreesoft.com/simple_inventory/eula</a>`);

    } else {
        $('#db').val(db);
    }

    $(document).on('keypress',function(e) {
        if(e.which == 13) {
            login();
        }
    });

    $('#loginButton').on('click', ()=>{
        login();
    })
})

function login() {
    if(!loginButtonClicked)
        loginButtonClicked = true;
    else
        return true;

    let db = commonModule.getValidValue('db');
    let username = commonModule.getValidValue('username');
    let password = commonModule.getValidValue('password');
    if(!username || !password) {
        loginButtonClicked = false;
        return false;
    }

    usersModule.getUserByUsername(username, db, (err, result)=>{
        if(err) {
            console.log(err);
            $('#resultDiv').html(err);
            loginButtonClicked = false;
        } else {
            if(Object.keys(result).length===0) {
                $('#resultDiv').html('No such user!');
                loginButtonClicked = false;
            } else {
                let tempResult = result[0];
                if(commonModule.encryptPassword(password) == tempResult.password) {
                    console.log('User authenticated successfully...');
                    $('#resultDiv').html('success!');
                    
                    // Set session cookies & redirect to index.html
                    if(!sessionURL)
                        sessionURL = 'http://localhost/';
                    session.defaultSession.cookies.set({url:sessionURL, name:'username', value:username});

                    // Fetch usertype permissions
                    let userPermissions = {};
                    usersModule.getPermissions(tempResult.usertypeID, (err, data)=>{
                        for(let i in data) {
                            userPermissions[data[i].usertypePermission] = data[i].usertypePermission;
                        }

                        let userSettings = remote.getGlobal('userSettings');
                        userSettings.usertypeID = tempResult.usertypeID;
                        userSettings.userPermissions = userPermissions;

                        // Set DB
                        userSettings.db = db;

                        usersModule.getDBSettings((err, result)=>{
                            if(!err) {
                                for(let i in result) {
                                    if(result[i].property=='name')
                                        userSettings.dbName = result[i].value;
                                    if(result[i].property=='description')
                                        userSettings.dbDescription = result[i].value;
                                }
                            }
                            console.log('Before saving...');
                            console.log(userSettings);
                            if(ipcRenderer.sendSync('save-global-user-settings', userSettings)) {
                                console.log('After saving...');
                                console.log(remote.getGlobal('userSettings'));
                                ipcRenderer.send('redirect-window', 'index.html', []);
                            }
                        });

                    })


                } else {
                    $('#resultDiv').html('failed!');
                    loginButtonClicked = false;
                }
            }
        }
    })    
}

function selectDB() {
    let defaultPath = commonModule.getDefaultDBPath();
    let db = $('#db').val();
    if(db) {
        defaultPath = path.dirname(db);
    }
    dialog.showOpenDialog({
        properties: ['openFile'],
        defaultPath: defaultPath
    }).then(result => {
        if(!result.canceled) {
            let db = result.filePaths[0];
            dbModule.setDB(db);
            dbModule.selectQuery('SELECT * FROM dbSettings WHERE property = \'version\'', (err, result)=>{
                if(err) {
                    $('#db').val('error!');
                    console.log(error);
                } else {
                    let dbVersion = result[0].value;
                    let version = require('electron').remote.getGlobal('userSettings').version;
                    if(commonModule.checkDBCompatibility(version, dbVersion)) {
                        $('#db').val(db);
                        return true;
                    } else {
                        alert(`dbVersion v${dbVersion} is incompatible with software v${version}`);
                        return true;
                    }
                }
            })
        }
    }).catch(err => {
        console.log(err)
    })
}