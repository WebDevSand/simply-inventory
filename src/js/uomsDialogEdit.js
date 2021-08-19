const remote = require('electron').remote;
const path = require('path');
const appPath = require('electron').remote.app.getAppPath();

const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const inventoryModule = require(path.join(appPath, 'src', 'modules', 'inventoryModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));

var uomID;

$(document).ready(()=>{
    if(usersModule.checkPermission('createUOM')) {
        console.log('Permission granted: createUOM');
        mainStuff();
    }
})

function mainStuff() {
    let additionalArgs = window.process.argv;
    for(let needle of additionalArgs) {
        if(needle.search('id=')===0) {
            let temp = needle.split('=');
            uomID = temp[1];
        }
    }

    inventoryModule.getUOM(uomID, (err, result)=>{
        if(err) {
            console.log(err);
            $('#contentDiv').html('Error has occured!');    
        } else {

            let resultHTML = `<div class="form-group row text-center" style="width:100%;">
                                    <div class="text-center col-md-12 col-lg-12"><b>Edit UOM</b></div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-3 col-lg-3 text-right">
                                        <label class="col-form-label">UOM Name</label>
                                    </div>
                                    <div class="col-md-9 col-lg-9">
                                        <input type="text" id="name" value="${result[0].name}" class="form-control" />
                                    </div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-3 col-lg-3 text-right">
                                        <label class="col-form-label">Prefix</label>
                                    </div>
                                    <div class="col-md-9 col-lg-9">
                                        <input type="text" id="prefix" value="${result[0].prefix}" class="form-control" />
                                    </div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-3 col-lg-3 text-right">
                                        <label class="col-form-label">Roundoff</label>
                                    </div>
                                    <div class="col-md-9 col-lg-9">
                                        <input type="text" id="roundoff" value="${result[0].roundoff}" class="form-control" />
                                    </div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-3 col-lg-3 text-right">
                                        <label class="col-form-label">Postfix</label>
                                    </div>
                                    <div class="col-md-9 col-lg-9">
                                        <input type="text" id="postfix" value="${result[0].postfix}" class="form-control" />
                                    </div>
                                </div>
                                <div class="container text-center" style="width:100%">
                                    <button class="btn btn-outline-secondary" id="editUOM" onclick="editUOMSaved(${uomID})">
                                        <i class="fa fa-save"></i> Save</button>
                                    <button class="btn btn-outline-secondary" id="cancel" onclick="cancelDialog()">
                                        <i class="fa fa-close"></i> Cancel</button>
                                </div>`;
            $('#contentDiv').html(resultHTML);
        }
    });    
}

function editUOMSaved(uomID) {
    let name = commonModule.getValidValue('name');
    let prefix = commonModule.getValidValue('prefix');
    let roundoff = commonModule.getValidValue('roundoff');
    let postfix = commonModule.getValidValue('postfix');
    if(!name || !roundoff)
        return false;
        
    let data = {name, prefix, roundoff, postfix};
    inventoryModule.editUOM(uomID, data, (err, result=0)=>{
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