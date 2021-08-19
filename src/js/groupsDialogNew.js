const remote = require('electron').remote;

const path = require('path');
const appPath = require('electron').remote.app.getAppPath();
const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const inventoryModule = require(path.join(appPath, 'src', 'modules', 'inventoryModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));

$(document).ready(()=>{
    if(usersModule.checkPermission('createGroup')) {
        console.log('Permission granted: createGroup');
        mainStuff();
    }
})

function mainStuff() {
    let resultHTML = `<div class="form-group row text-center" style="width:100%;">
                            <div class="text-center col-md-12 col-lg-12"><b>New Group</b></div>
                        </div>
                        <div class="form-group row" style="width:100%;">
                            <div class="col-md-3 col-lg-3 text-right">
                                <label class="col-form-label">Group Name</label>
                            </div>
                            <div class="col-md-9 col-lg-9">
                                <input type="text" id="groupName" value="" class="form-control" />
                            </div>
                        </div>
                        <div class="container text-center" style="width:100%">
                            <button class="btn btn-outline-secondary" id="editGroup" onclick="createGroup()">
                                <i class="fa fa-save"></i> Save</button>
                            <button class="btn btn-outline-secondary" id="cancel" onclick="cancelNewGroup()">
                                <i class="fa fa-close"></i> Cancel</button>
                        </div>`;
    $('#contentDiv').html(resultHTML);    
}

function createGroup() {
    let groupName = commonModule.getValidValue('groupName');
    let data = {name: groupName};
    inventoryModule.createGroup(data, (err, result=0)=>{
        if(err) {
            $('#contentDiv').html(err);
        } else {
            if(result=='success')
                cancelNewGroup();
        }
    });
}

function cancelNewGroup() {
    remote.getCurrentWindow()
        .close();
}

window.onerror = function(error, url, line) {
    console.log(error);
};