const ipcRenderer = require('electron').ipcRenderer;
const path = require('path');
const appPath = require('electron').remote.app.getAppPath();

const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));

$(document).ready(()=>{

    // Load side menu
    commonModule.loadSideMenu('users.html', (err, html)=>{
        $('#menuHolder').html(html);
    });

    if(usersModule.checkPermission('createUsers')) {
        console.log('Permission granted: createUsers');
        mainStuff();
    }
});

function mainStuff() {
    ipcRenderer.send('variable-request');

    ipcRenderer.on('variable-reply', function (event, args) {
        userID = args[0];

        // Load users
        usersModule.getUser(userID, (err, result)=>{
            if(err) {
                $('#contentDiv').html(err);
            } else {

                usersModule.getUsertypes((err, usertypes)=>{

                    // Create usertypes options
                    let usertypeOptions = '';
                    for(let i in usertypes) {
                        // Skip super usertype for non super users
                        if(result[0].usertypeID!=1 && usertypes[i].id==1)
                            continue;

                        let selected = '';
                        if(usertypes[i].id==result[0].usertypeID)
                            selected = 'selected="selected"';
                        usertypeOptions += `<option value="${usertypes[i].id}" ${selected}>${usertypes[i].name}</option>`;
                    }

                    let disabledSuper = '';
                    if(result[0].usertypeID==1)
                        disabledSuper = 'disabled="disabled"';

                    let resultHTML = `<div class="form-group row text-center" style="width:100%;">
                                        <div class="text-center col-md-12 col-lg-12"><b>Edit User</b></div>
                                    </div>
                                    <div class="form-group row" style="width:100%;">
                                        <div class="col-md-4 col-lg-4 text-right">
                                            <label class="col-form-label">Username</label>
                                        </div>
                                        <div class="col-md-7 col-lg-7">
                                            <input type="text" id="username" value="${result[0].username}" class="form-control" />
                                        </div>
                                    </div>
                                    <div class="form-group row" style="width:100%;">
                                        <div class="col-md-4 col-lg-4 text-right">
                                            <label class="col-form-label">Usertype</label>
                                        </div>
                                        <div class="col-md-7 col-lg-7">
                                            <select class="form-control" id="usertypeID" ${disabledSuper}>
                                                ${usertypeOptions}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="container text-center" style="width:100%">
                                        <input type="hidden" id="oldUsername" value="${result[0].username}" />
                                        <button class="btn btn-outline-secondary" id="editUOM" onclick="editUserSave(${userID})">
                                            <i class="fa fa-save"></i> Save</button>
                                        <button class="btn btn-outline-secondary" id="cancel" onclick="cancelDialog()">
                                            <i class="fa fa-close"></i> Cancel</button>
                                    </div>`;

                    $('#contentDiv').html(resultHTML);

                    $(document).on("click","tr.userRow", function(e){
                        let userID = commonModule.getRowID(e);
                        ipcRenderer.send('redirect-window', 'usersDialog.html', [`${userID}`]);
                    });
                })
                
            }
        });

    })    
}

window.onerror = function(error, url, line) {
    console.log(error);
};

function editUserSave(userID) {
    let username = commonModule.getValidValue('username');
    let usertypeID = commonModule.getValidValue('usertypeID');
    if(!username || !usertypeID)
        return false;

    let data = {username, usertypeID};
    usersModule.editUser(userID, data, (err, result)=>{
        if(err) {
            $('#usersDiv').html('Could not save changes!');
            console.log(err);
        } else {
            // Logout if user changes his own username
            let currentUsername = '';
            commonModule.checkLoggedIn((err, result)=>{
                if(!err)
                    currentUsername = result;
                let oldUsername = $('#oldUsername').val();
                if(oldUsername == currentUsername) {
                    alert('You have changed your own username\nPlease login again with username: '+username);
                    ipcRenderer.send('redirect-window', 'logout.html');
                } else {
                    ipcRenderer.send('redirect-window', 'users.html');
                }
            })
        }
    })
}

function cancelDialog() {
    ipcRenderer.send('redirect-window', 'users.html');
}