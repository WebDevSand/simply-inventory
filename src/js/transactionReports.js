const ipcRenderer = require('electron').ipcRenderer;

const path = require('path');
const appPath = require('electron').remote.app.getAppPath();
const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));
const inventoryModule = require(path.join(appPath, 'src', 'modules', 'inventoryModule.js'));

var itemsOptions = {};

$(document).ready(()=>{

    // Load side menu
    commonModule.loadSideMenu('transactionReports.html', (err, html)=>{
        $('#menuHolder').html(html);
    });

    if(usersModule.checkPermission('viewInventoryTransactions')) {
        console.log('Permission granted: viewInventoryTransactions');
        mainStuff();
    }
});

function mainStuff() {
    inventoryModule.getItems((err, result)=>{
        if(err) {
            console.log(err);
            $('#contentDiv').html('Error loading data');
        } else {
            let groups, subgroups, items;
            [groups, subgroups, items] = result;

            for(let groupKey in groups) {
                let groupID = groups[groupKey].id;
                let groupName = groups[groupKey].name;
                for(let subgroupKey in subgroups) {
                    if(subgroups[subgroupKey].groupID == groupID) {
                        let subgroupID = subgroups[subgroupKey].id;
                        let subgroupName = subgroups[subgroupKey].name;
                        for(let itemKey in items) {
                            if(items[itemKey].subgroupID == subgroupID) {
                                itemsOptions[items[itemKey].id] = `${groupName} - ${subgroupName} - ${items[itemKey].name}`;
                            }
                        }
                    }
                }
            }

            let resultHTML = `<h3>Transaction Reports</h3>
                                
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-3 col-lg-3 text-right">
                                        <label class="col-form-label">From</label>
                                    </div>
                                    <div class="col-md-6 col-lg-6">
                                        <input type="text" id="startDate" class="form-control text-center" style="width:150px" />
                                    </div>
                                </div>

                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-3 col-lg-3 text-right">
                                        <label class="col-form-label">To</label>
                                    </div>
                                    <div class="col-md-6 col-lg-6">
                                        <input type="text" id="endDate" class="form-control text-center" style="width:150px" />
                                    </div>
                                </div>

                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-3 col-lg-3 text-right">
                                        <label class="col-form-label">Item</label>
                                    </div>
                                    <div class="col-md-9 col-lg-9">
                                        <input type="text" id="itemName" class="form-control" />
                                        <input type="hidden" id="itemID" />
                                    </div>
                                </div>
                                
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-3 col-lg-3 text-right"></div>
                                    <div class="col-md-9 col-lg-9" id="itemSuggestion">

                                    </div>
                                </div>
                                
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-3 col-lg-3 text-right"></div>
                                    <div class="col-md-9 col-lg-9">
                                        <button class="btn btn-outline-secondary" onclick="fetchReport()">
                                            <i class="fa fa-file-excel-o"></i> Get Report
                                        </button>
                                    </div>
                                </div>`;
            $('#contentDiv').html(resultHTML);

            $('#itemName').keyup(()=>{
                $('#itemID').val('');
                searchItem($('#itemName').val());
            })

            $('#startDate').datetimepicker({
                timepicker: false,
                format: 'd-m-Y'
            });

            $('#endDate').datetimepicker({
                timepicker: false,
                format: 'd-m-Y'
            });
        }
    })    
}

window.onerror = function(error, url, line) {
    console.log(error);
};

function searchItem(char) {
    let results = {};
    for(let i in itemsOptions) {
        let item = itemsOptions[i].toLowerCase();
        if(item.indexOf(char)!=-1) {
            results[i] = itemsOptions[i];
        }
    }

    let finalResult = '';
    for(let i in results) {
        finalResult += `<a href="#itemName" onclick="selectItem(${i})">${results[i]}</a><br />`;
    }
    $('#itemSuggestion').html(finalResult);
}

function selectItem(itemID) {
    for(let i in itemsOptions) {
        if(i==itemID) {
            $('#itemName').val(itemsOptions[i]);
            $('#itemID').val(i);
        }
    }
    $('#itemSuggestion').html('');
}

function fetchReport() {
    let startDate = $('#startDate').val();
    let endDate = $('#endDate').val();
    let itemID = $('#itemID').val();
    ipcRenderer.send('redirect-window', 'transactionReportsView.html', [startDate, endDate, itemID]);
}