const remote = require('electron').remote;
const path = require('path');
const appPath = require('electron').remote.app.getAppPath();

const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const inventoryModule = require(path.join(appPath, 'src', 'modules', 'inventoryModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));

var groupID;

$(document).ready(()=>{
    if(usersModule.checkPermission('createUOM')) {
        console.log('Permission granted: createUOM');
        mainStuff();
    }
})

function mainStuff() {
    let resultHTML = `<div class="form-group row text-center" style="width:100%;">
                            <div class="text-center col-md-12 col-lg-12"><b>New UOM</b></div>
                        </div>
                        <div class="form-group row" style="width:100%;">
                            <div class="col-md-3 col-lg-3 text-right">
                                <label class="col-form-label">UOM Name</label>
                            </div>
                            <div class="col-md-9 col-lg-9">
                                <input type="text" id="uomName" value="" class="form-control" />
                            </div>
                        </div>
                        <div class="form-group row" style="width:100%;">
                            <div class="col-md-3 col-lg-3 text-right">
                                <label class="col-form-label">Prefix</label>
                            </div>
                            <div class="col-md-9 col-lg-9">
                                <input type="text" id="prefix" value="" class="form-control" />
                            </div>
                        </div>
                        <div class="form-group row" style="width:100%;">
                            <div class="col-md-3 col-lg-3 text-right">
                                <label class="col-form-label">Round-off</label>
                            </div>
                            <div class="col-md-9 col-lg-9">
                                <input type="text" id="roundoff" value="2" class="form-control" />
                            </div>
                        </div>
                        <div class="form-group row" style="width:100%;">
                            <div class="col-md-3 col-lg-3 text-right">
                                <label class="col-form-label">Postfix</label>
                            </div>
                            <div class="col-md-9 col-lg-9">
                                <input type="text" id="postfix" value="" class="form-control" />
                            </div>
                        </div>
                        <div class="container text-center" style="width:100%">
                            <button class="btn btn-outline-secondary" id="editGroup" onclick="createUOM()">
                                <i class="fa fa-save"></i> Save</button>
                            <button class="btn btn-outline-secondary" id="cancel" onclick="cancelDialog()">
                                <i class="fa fa-close"></i> Cancel</button>
                        </div>`;
    $('#contentDiv').html(resultHTML);    
}

function createUOM() {
    let name = commonModule.getValidValue('uomName');
    let prefix = commonModule.getValidValue('prefix');
    let roundoff = commonModule.getValidValue('roundoff');
    let postfix = commonModule.getValidValue('postfix');
    if(!name)
        return false;

    let data = {name, prefix, roundoff, postfix};
    inventoryModule.createUOM(data, (err, result=0)=>{
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