const remote = require('electron').remote;
const path = require('path');
const appPath = require('electron').remote.app.getAppPath();

const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const inventoryModule = require(path.join(appPath, 'src', 'modules', 'inventoryModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));

$(document).ready(()=>{
    if(usersModule.checkPermission('createSubGroup')) {
        console.log('Permission granted: createSubGroup');
        mainStuff();
    }
})

function mainStuff() {
    inventoryModule.getGroups((err, result)=>{
        let groupsDropdown = '';
        for(let key in result) {
            if(result[key])
                groupsDropdown += `<option value="${result[key].id}">${result[key].name}</option>`;
        }
        let resultHTML = `<div class="form-group row text-center" style="width:100%;">
                                <div class="text-center col-md-12 col-lg-12"><b>New Subgroup</b></div>
                            </div>
                            <div class="form-group row" style="width:100%;">
                                <div class="col-md-3 col-lg-3 text-right">
                                    <label class="col-form-label">Subgroup Name</label>
                                </div>
                                <div class="col-md-9 col-lg-9">
                                    <input type="text" id="subgroupName" value="" class="form-control" />
                                </div>
                            </div>
                            <div class="form-group row" style="width:100%;">
                                <div class="col-md-3 col-lg-3 text-right">
                                    <label class="col-form-label">Group</label>
                                </div>
                                <div class="col-md-9 col-lg-9">
                                    <select id="groupID" class="form-control">
                                        ${groupsDropdown}
                                    </select>
                                </div>
                            </div>
                            <div class="container text-center" style="width:100%">
                                <button class="btn btn-outline-secondary" id="editGroup" onclick="createSubgroup()">
                                    <i class="fa fa-save"></i> Save</button>
                                <button class="btn btn-outline-secondary" id="cancel" onclick="cancelDialog()">
                                    <i class="fa fa-close"></i> Cancel</button>
                            </div>`;
        $('#contentDiv').html(resultHTML);
    });    
}

function createSubgroup() {
    let subgroupName = commonModule.getValidValue('subgroupName');
    let groupID = commonModule.getValidValue('groupID');
    if(subgroupName=='' || groupID==0)
        return false;
    let data = {name: subgroupName, groupID:groupID};
    inventoryModule.createSubgroup(data, (err, result=0)=>{
        if(err) {
            $('#contentDiv').html(err);
        } else {
            if(result=='success')
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