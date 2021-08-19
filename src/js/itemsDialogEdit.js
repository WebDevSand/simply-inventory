const remote = require('electron').remote;
const path = require('path');
const appPath = require('electron').remote.app.getAppPath();
const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const inventoryModule = require(path.join(appPath, 'src', 'modules', 'inventoryModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));

var itemID;

$(document).ready(()=>{
    if(usersModule.checkPermission('createItem')) {
        console.log('Permission granted: createItem');
        mainStuff();
    }
})

function mainStuff() {
    let additionalArgs = window.process.argv;
    for(let needle of additionalArgs) {
        if(needle.search('id=')===0) {
            let temp = needle.split('=');
            itemID = temp[1];
        }
    }

    inventoryModule.getItemForEdit(itemID, (err, result)=>{
        if(err) {
            console.log(err);
            $('#contentDiv').html('Error has occured!');    
        } else {
            let item, subgroups, uoms;
            [item, subgroups, uoms] = result;
            console.log(subgroups);

            // Prepare subgroups dropdown
            let subgroupsDropdown = '<option value="">Please select</option>';
            for(let i in subgroups) {
                subgroupsDropdown += `<option value="${subgroups[i].id}" `+((item[0].subgroupID==subgroups[i].id) ? 'selected="selected"' : '')+`>${subgroups[i].name} [${subgroups[i].groupName}]</option>`;
            }

            // Prepare uoms dropdown
            let uomsDropdown = '<option value="">Please select</option>';
            for(let i in uoms) {
                uomsDropdown += `<option value="${uoms[i].id}" `+((item[0].uomID==uoms[i].id) ? 'selected="selected"' : '')+`>${uoms[i].name}</option>`;
            }
            let resultHTML = `<div class="form-group row text-center" style="width:100%;">
                                    <div class="text-center col-md-12 col-lg-12"><b>Edit Group</b></div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-3 col-lg-3 text-right">
                                        <label class="col-form-label">Item Name</label>
                                    </div>
                                    <div class="col-md-9 col-lg-9">
                                        <input type="text" id="name" value="${item[0].name}" class="form-control" />
                                    </div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-3 col-lg-3 text-right">
                                        <label class="col-form-label">Subgroup</label>
                                    </div>
                                    <div class="col-md-9 col-lg-9">
                                        <select id="subgroupID" class="form-control">
                                            ${subgroupsDropdown}
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-3 col-lg-3 text-right">
                                        <label class="col-form-label">UOM</label>
                                    </div>
                                    <div class="col-md-9 col-lg-9">
                                        <select id="uomID" class="form-control">
                                            ${uomsDropdown}
                                        </select>
                                    </div>
                                </div>
                                <div class="container text-center" style="width:100%">
                                    <button class="btn btn-outline-secondary" id="editGroup" onclick="editItemSaved(${itemID})">
                                        <i class="fa fa-save"></i> Save</button>
                                    <button class="btn btn-outline-secondary" id="cancel" onclick="cancelEditGroup()">
                                        <i class="fa fa-close"></i> Cancel</button>
                                </div>`;
            $('#contentDiv').html(resultHTML);
        }
    });    
}

function editItemSaved(itemID) {
    let name = commonModule.getValidValue('name');
    let subgroupID = commonModule.getValidValue('subgroupID');
    let uomID = commonModule.getValidValue('uomID');
    let data = {name, subgroupID, uomID};
    if(!name || !subgroupID || !uomID)
        return false;

    inventoryModule.editItem(itemID, data, (err, result=0)=>{
        if(err) {
            $('#contentDiv').html(err);
        } else {
            if(result=='success')
                cancelEditGroup();
        }
    });
}

function cancelEditGroup() {
    remote.getCurrentWindow()
        .close();
}

window.onerror = function(error, url, line) {
    console.log(error);
};