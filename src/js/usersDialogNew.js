const remote = require('electron').remote;
const path = require('path');
const appPath = require('electron').remote.app.getAppPath();

const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));

$(document).ready(()=>{
    if(usersModule.checkPermission('createUsers')) {
        console.log('Permission granted: createUsers');
        mainStuff();
    }
})

function mainStuff() {
    usersModule.getUsertypes((err, rows)=>{
        if(err) {
            $('contentDiv').html('Error fetching data!');
            console.log(err);
        } else {
            // Create dropdown
            let usertypesDropdown = ``;
            for(let i in rows) {
                if(rows[i].name == 'super')
                    continue;

                usertypesDropdown += `<option value="${rows[i].id}">${rows[i].name}</option>`;
            }

            let resultHTML = `<div class="form-group row text-center" style="width:100%;">
                                    <div class="text-center col-md-12 col-lg-12"><b>New User</b></div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-4 col-lg-4 text-right">
                                        <label class="col-form-label">Username</label>
                                    </div>
                                    <div class="col-md-6 col-lg-6">
                                        <input type="text" id="username" value="" class="form-control" />
                                    </div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-4 col-lg-4 text-right">
                                        <label class="col-form-label">Usertype</label>
                                    </div>
                                    <div class="col-md-6 col-lg-6">
                                        <select id="usertypeID" class="form-control">
                                            ${usertypesDropdown}
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-4 col-lg-4 text-right">
                                        <label class="col-form-label">Password</label>
                                    </div>
                                    <div class="col-md-6 col-lg-6">
                                        <input type="password" id="password" value="pass@1234" class="form-control" />
                                        <br />
                                        <span class="smallFont">Default password: <b>pass@1234</b></span>
                                    </div>
                                </div>
                                <div class="text-center" style="width:100%;">
                                    <button class="btn btn-outline-secondary" onclick="createUser()">
                                        <i class="fa fa-save"></i> Create User</button>
                                    <button class="btn btn-outline-secondary" onclick="cancelDialog()">
                                        <i class="fa fa-close"></i> Cancel</button>
                                </div>`;
            $('#contentDiv').html(resultHTML);
        }
    })    
}

function createUser() {
    let username = commonModule.getValidValue('username');
    let usertypeID = commonModule.getValidValue('usertypeID');
    let password = commonModule.getValidValue('password');

    if(!usertypeID)
        alert('Please select approprite usertype.\nIf you dont see a usertype here, create one first!');

    if(!username || !usertypeID || !password)
        return false;

    if(!commonModule.validatePassword(password)) {
        alert('Password should be 6-16 characters and contain atleast one number and one special character');
        return false;
    }

    let data = {
            username, 
            usertypeID, 
            password:commonModule.encryptPassword(password)
        };
    usersModule.createUser(data, (err, result)=>{
        if(err) {
            $('#contentDiv').html('Error saving details!');
        } else {
            cancelDialog();
        }
    });
}

function cancelDialog() {
    remote.getCurrentWindow()
        .close();
}

window.onerror = function(error, url, line) {
    console.log(error);
};