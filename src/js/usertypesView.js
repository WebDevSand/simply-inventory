const ipcRenderer = require('electron').ipcRenderer;
const path = require('path');
const appPath = require('electron').remote.app.getAppPath();

const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));

$(document).ready(()=>{

    // Load side menu
    commonModule.loadSideMenu('usertypes.html', (err, html)=>{
        $('#menuHolder').html(html);
    });
    
    if(usersModule.checkPermission('createUsertypes')) {
        console.log('Permission granted: createUsertypes');
        mainStuff();
    }
});

function mainStuff() {
    ipcRenderer.send('variable-request');

    ipcRenderer.on('variable-reply', function (event, args) {
        usertypeID = args[0];

        usersModule.getUsertypeDetails(usertypeID, (err, result)=>{
            if(err) {
                $('#usersDiv').html('Could not load data!');
            } else {
                let usertypeDetails, usertypePermissionsObject;
                [usertypeDetails, usertypePermissionsObject] = result;
                let allPermissions = usersModule.usertypePermissions;
                
                // Iterate through usertypePermissionsObject to create array
                let usertypePermissions = [];
                for(let i in usertypePermissionsObject) {
                    usertypePermissions[usertypePermissionsObject[i].usertypePermission] = usertypePermissionsObject[i].usertypePermission;
                }

                let resultHTML = `<h4><i class="fa fa-users"></i> Edit Usertype Details</h4>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-3 col-lg-3 text-right">
                                        <label class="col-form-label">Usertype</label>
                                    </div>
                                    <div class="col-md-9 col-lg-9">
                                        <input type="text" id="name" value="${usertypeDetails[0].name}" ${((usertypeDetails[0].name=='super') ? 'disabled' : '')} class="form-control" />
                                    </div>
                                </div>
                                <div class="text-center" style="width:100%;">
                                    <button class="btn btn-outline-secondary" ${((usertypeDetails[0].name=='super') ? 'disabled' : '')} onclick="saveUsertypePermissions(${usertypeID})"><i class="fa fa-save"></i> Save Changes</button>
                                    <button class="btn btn-outline-secondary" onclick="cancelWindow()"><i class="fa fa-close"></i> Cancel</button>
                                </div>
                                <div style="padding:20px;">
                                    <table class="table table-sm table-hover table-light">
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <th>Permission</th>
                                            </tr>
                                        </thead>
                                        <tbody>`;

                for(let i in allPermissions) {
                    let checked = '';
                    if(usertypePermissions[i])
                        checked = 'checked="checked"';
                    
                    resultHTML += `<tr>
                                        <td><input type="checkbox" ${((usertypeDetails[0].name=='super') ? 'disabled' : '')} class="form-control usertypePermission" id="${i}" ${checked} /></td>
                                        <td>${allPermissions[i]}</td>
                                    </tr>`;
                }
                resultHTML += `</tbody></table></div>`;
                $('#usersDiv').html(resultHTML);
            }
        })
    })    
}

window.onerror = function(error, url, line) {
    console.log(error);
};

function saveUsertypePermissions(usertypeID) {
    let name = commonModule.getValidValue('name');
    if(!name)
        return false;
    
    // Iterate through all usertypePermissions
    let checkboxes = document.querySelectorAll('.usertypePermission');
    let data = [];
    for(let i in checkboxes) {
        if(checkboxes[i].checked)
            data.push(checkboxes[i].id);
    }
    console.log(data);

    // Update name and data
    usersModule.updateUsertype(usertypeID, name, data, (err, result)=>{
        if(err) {
            $('#usersDiv').html('Could not save data!');
            console.log(err);
        } else {
            ipcRenderer.send('redirect-window', 'usertypes.html');
        }
    })
}

function cancelWindow() {
    ipcRenderer.send('redirect-window', 'usertypes.html');
}