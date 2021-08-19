const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;
const path = require('path');
const appPath = require('electron').remote.app.getAppPath();

const inventoryModule = require(path.join(appPath, 'src', 'modules', 'inventoryModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));

var uomID;

$(document).ready(()=>{
    if(usersModule.checkPermission('createUOM')) {
        console.log('Permission granted: createUOM');
        mainStuff();
    }
});

function mainStuff() {


    let additionalArgs = window.process.argv;
    for(let needle of additionalArgs) {
        if(needle.search('id=')===0) {
            let temp = needle.split('=');
            uomID = temp[1];
        }
    }

    inventoryModule.getUOM(uomID, function(err, result) {
        if(err) {
            console.log(err);
            $('#contentDiv').html('Error has occured!');    
        } else {
            let resultHTML = `<div class="form-group row text-center" style="width:100%;">
                                    <div class="text-center col-md-12 col-lg-12"><b>Group Details</b></div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-6 col-lg-6 text-right">
                                        UOM
                                    </div>
                                    <div class="col-md-6 col-lg-6">
                                        <b>${result[0].name}</b>
                                    </div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-6 col-lg-6 text-right">
                                        Prefix
                                    </div>
                                    <div class="col-md-6 col-lg-6">
                                        <b>${result[0].prefix}</b>
                                    </div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-6 col-lg-6 text-right">
                                        Roundoff
                                    </div>
                                    <div class="col-md-6 col-lg-6">
                                        <b>${result[0].roundoff}</b>
                                    </div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-6 col-lg-6 text-right">
                                        Postfix
                                    </div>
                                    <div class="col-md-6 col-lg-6">
                                        <b>${result[0].postfix}</b>
                                    </div>
                                </div>
                                <div class="container text-center" style="width:100%">
                                    <button class="btn btn-outline-secondary" id="editUOM" onclick="editUOM(${uomID})">
                                        <i class="fa fa-edit"></i> Edit</button>
                                    <button class="btn btn-outline-secondary" id="cancelButton" onclick="cancelDialog()">
                                        <i class="fa fa-close"></i> Cancel</button>
                                </div>`;
            $('#contentDiv').html(resultHTML);
        }
    });    
}

function editUOM(uomID) {
    let tempWindow = remote.getCurrentWindow();
    ipcRenderer.send('open-new-window', 'uomsDialogEdit.html', [`id=${uomID}`], 800, 600);
}

window.onerror = function(error, url, line) {
    console.log(error);
};

function cancelDialog() {
    remote.getCurrentWindow()
        .close();
}