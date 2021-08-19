const remote = require('electron').remote;
const path = require('path');
const appPath = require('electron').remote.app.getAppPath();
const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const inventoryModule = require(path.join(appPath, 'src', 'modules', 'inventoryModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));

var subgroupID;

$(document).ready(()=>{
    if(usersModule.checkPermission('createSubGroup')) {
        console.log('Permission granted: createSubGroup');
        mainStuff();
    }
})

function mainStuff() {
    let additionalArgs = window.process.argv;
    for(let needle of additionalArgs) {
        if(needle.search('id=')===0) {
            let temp = needle.split('=');
            subgroupID = temp[1];
        }
    }

    inventoryModule.getSubgroupForEdit(subgroupID, (err, result)=>{
        if(err) {
            console.log(err);
            $('#contentDiv').html('Error has occured!');    
        } else {
            console.log(result);
            let subgroup = result[1];
            let groups = result[0];
            let groupsDropdown = '<option value="">Please select</option>';
            for(let key in groups) {
                if(groups[key])
                    groupsDropdown += `<option value="${groups[key].id}" `+((subgroup[0].groupID==groups[key].id) ? 'selected="selected"' : '')+`>${groups[key].name}</option>`;
            }

            let resultHTML = `<div class="form-group row text-center" style="width:100%;">
                                    <div class="text-center col-md-12 col-lg-12"><b>Edit Group</b></div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-3 col-lg-3 text-right">
                                        <label class="col-form-label">Subgroup Name</label>
                                    </div>
                                    <div class="col-md-9 col-lg-9">
                                        <input type="text" id="name" value="${subgroup[0].name}" class="form-control" />
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
                                    <button class="btn btn-outline-secondary" id="editGroup" onclick="editSubgroupSaved(${subgroupID})">
                                        <i class="fa fa-save"></i> Save</button>
                                    <button class="btn btn-outline-secondary" id="cancel" onclick="cancelDialog()">
                                        <i class="fa fa-close"></i> Cancel</button>
                                </div>`;
            $('#contentDiv').html(resultHTML);
        }
    });    
}

function editSubgroupSaved(subgroupID) {
    let name = commonModule.getValidValue('name');
    let groupID = commonModule.getValidValue('groupID');
    if(!name || !groupID)
        return false;
        
    let data = {name, groupID};
    inventoryModule.editSubgroup(subgroupID, data, (err, result=0)=>{
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