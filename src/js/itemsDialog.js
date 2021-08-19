const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;

const path = require('path');
const appPath = require('electron').remote.app.getAppPath();
const inventoryModule = require(path.join(appPath, 'src', 'modules', 'inventoryModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));

var itemID;

$(document).ready(()=>{
    if(usersModule.checkPermission('createItem')) {
        console.log('Permission granted: createItem');
        mainStuff();
    }
});

function mainStuff() {
    let additionalArgs = window.process.argv;
    for(let needle of additionalArgs) {
        if(needle.search('id=')===0) {
            let temp = needle.split('=');
            itemID = temp[1];
        }
    }

    inventoryModule.getItem(itemID, function(err, result) {
        if(err) {
            console.log(err);
            $('#contentDiv').html('Error has occured!');    
        } else {
            let itemDetails = result[0];
            let subgroupDetails = result[1];
            let resultHTML = `<div class="form-group row text-center" style="width:100%;">
                                    <div class="text-center col-md-12 col-lg-12"><b>Item Details</b></div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-6 col-lg-6 text-right">
                                        Item
                                    </div>
                                    <div class="col-md-6 col-lg-6">
                                        <b>${itemDetails[0].name}</b>
                                    </div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-6 col-lg-6 text-right">
                                        Subgroup
                                    </div>
                                    <div class="col-md-6 col-lg-6">
                                        <b>${subgroupDetails[0].name}</b>
                                    </div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-6 col-lg-6 text-right">
                                        Group
                                    </div>
                                    <div class="col-md-6 col-lg-6">
                                        <b>${subgroupDetails[0].groupName}</b>
                                    </div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-6 col-lg-6 text-right">
                                        UOM
                                    </div>
                                    <div class="col-md-6 col-lg-6">
                                        <b>${itemDetails[0].uomName}</b>
                                    </div>
                                </div>
                                <div class="container text-center" style="width:100%">
                                    <input type="hidden" name="groupID" id="groupID" value="${itemID}" />
                                    <button class="btn btn-outline-secondary" id="editItem" onclick="editItem(${itemID})">
                                        <i class="fa fa-edit"></i> Edit</button>
                                    <button class="btn btn-outline-secondary" id="cancelButton" onclick="cancelDialog()">
                                        <i class="fa fa-close"></i> Cancel</button>
                                </div>`;
            $('#contentDiv').html(resultHTML);
        }
    });    
}

function editItem(groupID) {
    let tempWindow = remote.getCurrentWindow();
    ipcRenderer.send('open-new-window', 'itemsDialogEdit.html', [`id=${itemID}`], 800, 600);
}

window.onerror = function(error, url, line) {
    console.log(error);
};

function cancelDialog() {
    remote.getCurrentWindow()
        .close();
}