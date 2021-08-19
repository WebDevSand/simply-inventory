const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;

const path = require('path');
const appPath = require('electron').remote.app.getAppPath();
const inventoryModule = require(path.join(appPath, 'src', 'modules', 'inventoryModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));

var groupID;

$(document).ready(()=>{
    if(usersModule.checkPermission('createGroup')) {
        console.log('Permission granted: createGroup');
        mainStuff();
    }
});

function mainStuff() {
    let additionalArgs = window.process.argv;
    for(let needle of additionalArgs) {
        if(needle.search('id=')===0) {
            let temp = needle.split('=');
            groupID = temp[1];
        }
    }

    inventoryModule.getGroup(groupID, function(err, result) {
        if(err) {
            console.log(err);
            $('#contentDiv').html('Error has occured!');    
        } else {
            let resultHTML = `<div class="form-group row text-center" style="width:100%;">
                                    <div class="text-center col-md-12 col-lg-12"><b>Group Details</b></div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-6 col-lg-6 text-right">
                                        Group Name
                                    </div>
                                    <div class="col-md-6 col-lg-6">
                                        <b>${result[0].name}</b>
                                    </div>
                                </div>
                                <div class="container text-center" style="width:100%">
                                    <input type="hidden" name="groupID" id="groupID" value="${groupID}" />
                                    <button class="btn btn-outline-secondary" id="editGroup" onclick="editGroup(${groupID})">
                                        <i class="fa fa-edit"></i> Edit</button>
                                    <button class="btn btn-outline-secondary" id="cancelButton" onclick="cancelDialog()">
                                        <i class="fa fa-close"></i> Cancel</button>
                                </div>`;
            $('#contentDiv').html(resultHTML);
        }
    });    
}

function editGroup(groupID) {
    let tempWindow = remote.getCurrentWindow();
    ipcRenderer.send('open-new-window', 'groupsDialogEdit.html', [`id=${groupID}`], 800, 600);
}

window.onerror = function(error, url, line) {
    console.log(error);
};

function cancelDialog() {
    remote.getCurrentWindow()
        .close();
}