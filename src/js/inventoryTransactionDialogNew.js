const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;
const moment = require('moment');

const path = require('path');
const appPath = require('electron').remote.app.getAppPath();
const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));
const inventoryModule = require(path.join(appPath, 'src', 'modules', 'inventoryModule.js'));

var itemID, receipt, itemName, month;

let username;
commonModule.checkLoggedIn((err, user)=>{
    if(err) {
        ipcRenderer.send('redirect-window', 'login.html', []);
    } else {
        username = user;
    }
})

$(document).ready(()=>{
    if(usersModule.checkPermission('performInventoryTransactions')) {
        console.log('Permission granted: performInventoryTransactions');
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

        if(needle.search('receipt=')===0) {
            let temp = needle.split('=');
            receipt = temp[1];
            if(receipt=='true')
                receipt = true;
            else
                receipt = false;
        }

        if(needle.search('itemName=')===0) {
            let temp = needle.split('=');
            itemName = temp[1];
        }

        if(needle.search('month=')===0) {
            let temp = needle.split('=');
            month = temp[1];
        }
    }

    console.log(`itemID: ${itemID} & receipt: ${receipt} & itemName: ${itemName} & month: ${month}`);

    let resultHTML = `<div class="form-group row text-center" style="width:100%;">
                            <div class="text-center col-md-12 col-lg-12"><b>New Inventory Receipt</b></div>
                        </div>
                        <div class="row form-group" style="width:100%;">
                            <div class="col-md-3 col-lg-3 text-right">
                                Item
                            </div>
                            <div class="col-md-9 col-lg-9">
                                <b>${itemName}</b>
                            </div>
                        </div>
                        <div class="form-group row" style="width:100%;">
                            <div class="col-md-3 col-lg-3 text-right">
                                <label class="col-form-label">Date</label>
                            </div>
                            <div class="col-md-9 col-lg-9">
                                <input type="text" id="date" class="form-control" />
                            </div>
                        </div>
                        <div class="form-group row" style="width:100%;">
                            <div class="col-md-3 col-lg-3 text-right">
                                <label class="col-form-label">`+(receipt ? 'Receipt' : 'Issue')+` Qty</label>
                            </div>
                            <div class="col-md-9 col-lg-9">
                                <input type="text" id="receipts" class="form-control" />
                            </div>
                        </div>
                        `+(receipt ? `
                        <div class="form-group row" style="width:100%;">
                            <div class="col-md-3 col-lg-3 text-right">
                                <label class="col-form-label">Unit Price</label>
                            </div>
                            <div class="col-md-9 col-lg-9">
                                <input type="text" id="unitValue" class="form-control" />
                            </div>
                        </div>` : ``)+`
                        <div class="form-group row" style="width:100%;">
                            <div class="col-md-3 col-lg-3 text-right">
                                <label class="col-form-label">Comments</label>
                            </div>
                            <div class="col-md-9 col-lg-9">
                                <input type="text" id="comments" class="form-control" />
                            </div>
                        </div>
                        <div class="form-group row" style="width:100%;">
                            <div class="col-md-3 col-lg-3 text-right">
                                <label class="col-form-label">Username</label>
                            </div>
                            <div class="col-md-9 col-lg-9">
                                <input type="text" id="username" class="form-control" readonly value="${username}" />
                            </div>
                        </div>
                        <div class="container text-center" style="width:100%">
                            <button class="btn btn-outline-secondary" id="editGroup" onclick="newTransaction(${itemID})">
                                <i class="fa fa-save"></i> Save</button>
                            <button class="btn btn-outline-secondary" id="cancel" onclick="cancelDialog()">
                                <i class="fa fa-close"></i> Cancel</button>
                        </div>`;
    $('#contentDiv').html(resultHTML);
    $('#date').datetimepicker({
        timepicker: true,
        format: 'd-m-Y H:i'
    });    
}

function cancelDialog() {
    remote.getCurrentWindow()
        .close();
}

function newTransaction(itemID) {
    let date = commonModule.getValidValue('date');
    let receipts = commonModule.getValidValue('receipts');
    let comments = $('#comments').val();
    date = moment(date, "DD-MM-YYYY kk:mm");
    if(!date || !receipts)
        return false;

    let unitValue = 0;
    if(receipt) {
        unitValue = commonModule.getValidValue('unitValue');
        if(!unitValue)
            return false;
    } else {
        receipts = receipts * -1;
    }

    let data = {
        itemID: itemID,
        datetime: date.unix(),
        receipts,
        unitValue,
        comments,
        username
    };
    console.log(data);
    inventoryModule.newTransaction(data, (err, result)=>{
        if(err) {
            $('#contentDiv').html('Could not save data!');
            console.log(err);
        } else {
            cancelDialog();
        }
    })
}