const remote = require('electron').remote;
const path = require('path');
const appPath = require('electron').remote.app.getAppPath();

const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const inventoryModule = require(path.join(appPath, 'src', 'modules', 'inventoryModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));

$(document).ready(()=>{
    if(usersModule.checkPermission('createItem')) {
        console.log('Permission granted: createItem');
        mainStuff();
    }
})

function mainStuff() {
    inventoryModule.getGroupsSubgroupsAndUOMs((err, result)=>{
        if(err) {
            $('#contentDiv').html('Error accessing database!');
        } else {
            let groups, subgroups, uoms;
            [groups, subgroups, uoms] = result;
            let groupsArray = [];
            for(let key in groups) {
                groupsArray[groups[key].id] = groups[key].name;
            }

            let subgroupsDropdown = '<option value="">Please select</option>';
            for(let key in subgroups) {
                subgroupsDropdown += `<option value="${subgroups[key].id}">${subgroups[key].name} [${groupsArray[subgroups[key].groupID]}]</option>`;
            }

            let uomsDropdown = '<option value="">Please select</option>';
            for(let key in uoms) {
                uomsDropdown += `<option value="${uoms[key].id}">${uoms[key].name}</option>`;
            }

            let resultHTML = `<div class="form-group row text-center" style="width:100%;">
                                <div class="text-center col-md-12 col-lg-12"><b>New Item</b></div>
                            </div>
                            <div class="form-group row" style="width:100%;">
                                <div class="col-md-3 col-lg-3 text-right">
                                    <label class="col-form-label">Item Name</label>
                                </div>
                                <div class="col-md-9 col-lg-9">
                                    <input type="text" id="itemName" value="" class="form-control" />
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
                                <button class="btn btn-outline-secondary" onclick="createItem()">
                                    <i class="fa fa-save"></i> Save</button>
                                <button class="btn btn-outline-secondary" id="cancel" onclick="cancelDialog()">
                                    <i class="fa fa-close"></i> Cancel</button>
                            </div>`;
                    $('#contentDiv').html(resultHTML);
        }
    });    
}

function createItem() {
    let name = commonModule.getValidValue('itemName');
    let subgroupID = commonModule.getValidValue('subgroupID');
    let uomID = commonModule.getValidValue('uomID');
    if(!name || !subgroupID || !uomID)
        return false;

    let data = {name, subgroupID, uomID};
    inventoryModule.createItem(data, (err, result=0)=>{
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