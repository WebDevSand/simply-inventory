const fs = require('fs');
const appPath = require('electron').remote.app.getAppPath();
const userPath = require('electron').remote.app.getPath('userData');

const path = require('path');
const ipcRenderer = require('electron').ipcRenderer;
const dialog = require('electron').remote.dialog;

const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));

$(document).ready(()=>{
    // Load side menu
    commonModule.loadSideMenu('createDB.html', (err, html)=>{
        $('#menuHolder').html(html);
    });
    
    if(usersModule.getUsertype()===1) {
        console.log('Permission granted: super (usertype)');
        mainStuff();
    }
});

function mainStuff() {
    let resultHTML = `<div class="form-group row text-right">
                            <label for="username" class="col-lg-3 col-md-3 col-form-label">DB Folder</label>
                            <div class="input-group col-lg-8 col-md-8">
                                <div class="input-group-prepend">
                                <button class="btn btn-outline-secondary" type="button" onclick="selectDBFolder()">Select Folder</button>
                                </div>
                                <input type="text" class="form-control" aria-label="" aria-describedby="basic-addon1" id="dbFolder" value="">
                            </div>
                        </div>
                        <div class="form-group row text-right">
                            <label for="username" class="col-lg-3 col-md-3 col-form-label">DB Name</label>
                            <div class="col-lg-8 col-md-8">
                                <input type="text" class="form-control text-center" id="dbName" value="">
                            </div>
                        </div>
                        <div class="form-group row text-left">
                            <div class="col-lg-3 col-md-3"></div>
                            <div class="col-lg-8 col-md-8">
                                Default username: <b>admin</b>
                                <br />
                                Default password: <b>pass@1234</b>
                            </div>
                        </div>
                        <div class="form-group row text-center">
                            <div class="col-lg-5 col-md-5"></div>
                            <div class="col-lg-4 col-md-4 text-center">
                                <button class="btn btn-outline-primary" id="saveButton" onclick="createDB()">
                                    <i class="fa fa-save"></i> Create DB
                                </button>
                            </div>
                        </div>`;
    $('#contentDiv').html(resultHTML);
}

window.onerror = function(error, url, line) {
    console.log(error);
};

function selectDBFolder() {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }).then(result => {
        if(!result.canceled)
            $('#dbFolder').val(result.filePaths[0]);
    }).catch(err => {
        console.log(err)
    })
}

function createDB() {
    let dbFolder = commonModule.getValidValue('dbFolder');
    let dbName = commonModule.getValidValue('dbName');

    // dbFolder/dbName will be created or overwritten by default.
    fs.copyFile(path.join(appPath, 'src', 'db', 'skeleton.db'), path.join(dbFolder, dbName), (err) => {
        if (err) {
            console.log(err);
            alert(err);
        } else {
            console.log('Successfully copied database');
            // Set DB
            require('electron').remote.getGlobal('userSettings').db = path.join(dbFolder,dbName);
            let userSettings = require('electron').remote.getGlobal('userSettings');
            fs.writeFileSync(path.join(userPath, 'misc', 'userSettings'), JSON.stringify(userSettings));

            alert('Successfully created new Database!\nPlease sign in for first time with admin / pass@1234');
            ipcRenderer.send('redirect-window', 'logout.html', []);
        }
    });
}