const ipcRenderer = require('electron').ipcRenderer;
const moment = require('moment');

const path = require('path');
const appPath = require('electron').remote.app.getAppPath();
const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));
const inventoryModule = require(path.join(appPath, 'src', 'modules', 'inventoryModule.js'));

var itemID;
var month;

$(document).ready(()=>{

    // Load side menu
    commonModule.loadSideMenu('inventoryTransactions.html', (err, html)=>{
        $('#menuHolder').html(html);
    });

    if(usersModule.checkPermission('viewInventoryTransactions')) {
        console.log('Permission granted: viewInventoryTransactions');
        mainStuff();
    }
});

function mainStuff() {

    ipcRenderer.send('variable-request');

    ipcRenderer.on('variable-reply', function (event, args) {

        itemID = args[0];
        if(args[1])
            month = moment(args[1]);
        else
            month = moment().startOf('month');

        let fromDate = month.clone();
        let toDate = moment(month.clone()).endOf('month');
        console.log('Displaying details from '+fromDate.toLocaleString()+' to '+toDate.toLocaleString());

        inventoryModule.getItemTransactionDetails(itemID, fromDate.unix(), toDate.unix(), (err, result)=>{
            if(err) {
                console.error(err);
                $('#contentDiv').html('Error loading data!');
            } else {
                let openingStock = result[0][0].openingStock;
                if(!openingStock)
                    openingStock = 0;
                let transactions = result[1];
                let uom = result[2][0];

                let monthsOptions = commonModule.getMonthsDropdownOptions(month);

                let resultHTML = `<h4>${uom.itemName}</h4>
                                    <div id="itemGroupDetails"></div>
                                    <div style="padding-top:10px">
                                        <button class="btn btn-outline-secondary" id="receiptButton">
                                            <i class="fa fa-plus-circle"></i> Receipt
                                        </button>
                                        <button class="btn btn-outline-secondary" id="issueButton">
                                            <i class="fa fa-minus-circle"></i> Issue
                                        </button>
                                    </div>
                                    <div style="width:100%;padding:20px;" class="text-center">
                                        <button class="btn btn-outline-success" id="backButton"><</button>
                                            <select class="form-control" style="width:200px;display:inline-block;" id="month">
                                                ${monthsOptions}
                                            </select>
                                        <button class="btn btn-outline-success" id="forwardButton">></button>
                                    </div>
                                <table class="table table-sm table-light table-bordered table-hover">
                                    <thead>
                                        <tr class="text-center">
                                            <th>Date</th>
                                            <th>Opening Stock</th>
                                            <th>Receipts</th>
                                            <th>Issues</th>
                                            <th>Closing Stock</th>
                                            <th>Comments</th>
                                            <th>Username</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td></td>
                                            <td class="text-right"><b>${commonModule.uomFormat(openingStock, uom)}</b></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>`;
                let [receipts, issues, closingStock] = [0,0, openingStock];
                for(let key in transactions) {
                    if(transactions[key].receipts > 0) {
                        receipts = transactions[key].receipts;
                        issues = 0;
                    } else {
                        receipts = 0;
                        issues = transactions[key].receipts * -1;
                    }
                    closingStock = closingStock+receipts-issues;
                    let tempValue = '';
                    if(transactions[key].unitValue) {
                        tempValue += `<br /><span class="smallFont">@ ${commonModule.currencyFormat(transactions[key].unitValue)}</span>`;
                    }
                    let comments = '';
                    if(transactions[key].comments) {
                        comments = commonModule.fold(transactions[key].comments, 30).join('<br />');
                    }
                    resultHTML += `<tr class="clickable transactionRow" id="row_${transactions[key].id}">
                                        <td class="text-center">${moment.unix(transactions[key].datetime).format('DD MMM, YYYY')}</td>
                                        <td></td>
                                        <td class="text-right">${(receipts ? commonModule.uomFormat(receipts, uom) : '')}${tempValue}</td>
                                        <td class="text-right">${(issues ? commonModule.uomFormat(issues, uom) : '')}</td>
                                        <td class="text-right">${commonModule.uomFormat(closingStock, uom)}</td>
                                        <td class="text-left smallFont">${comments}</td>
                                        <td class="text-center smallFont">${transactions[key].username}</td>
                                    </tr>`;
                }
                resultHTML += `<tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td class="text-right"><b>${commonModule.uomFormat(closingStock, uom)}</b></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                </tbody>
                            </table>`;
                $('#contentDiv').html(resultHTML);

                // Month selector
                $('#month').on('change', (e)=>{
                    let tempMonth = $('#month').val();
                    ipcRenderer.send('redirect-window', 'inventoryTransactionDetails.html', [itemID, tempMonth]);
                })

                $('#backButton').on('click', (e)=>{
                    month.subtract(1, 'month');
                    ipcRenderer.send('redirect-window', 'inventoryTransactionDetails.html', [itemID, month.format('YYYY-MM-DD')]);
                })
                
                $('#forwardButton').on('click', (e)=>{
                    let currentMonth = moment().startOf('month');
                    let newMonth = month.clone();
                    newMonth.add(1, 'month');
                    // If month greater than current month, do nothing
                    if(newMonth.diff(currentMonth)>0)
                        return false;
                    else
                        ipcRenderer.send('redirect-window', 'inventoryTransactionDetails.html', [itemID, newMonth.format('YYYY-MM-DD')]);
                })

                // Receipt button
                $('#receiptButton').on('click', (e)=>{
                    ipcRenderer.send('open-new-window', 'inventoryTransactionDialogNew.html', ['id='+itemID,'receipt='+true, 'itemName='+uom.itemName, 'month='+month.format('YYYY-MM-DD')]);
                })

                // Issue button
                $('#issueButton').on('click', (e)=>{
                    ipcRenderer.send('open-new-window', 'inventoryTransactionDialogNew.html', ['id='+itemID,'receipt='+false, 'itemName='+uom.itemName, 'month='+month.format('YYYY-MM-DD')]);
                })

                // Load itemGroupDetails
                inventoryModule.getSubgroup(uom.subgroupID, (err, result)=>{
                    if(err) {
                        $('#itemGroupDetails').html('Error loading data!');
                    } else {
                        let tempHTML = `Subgroup: <b>${result[0].name}</b>
                                        <br />Group: <b>${result[0].groupName}</b>
                                        <br />`;
                        $('#itemGroupDetails').html(tempHTML);
                    }
                })
            }
        });
    });    
}

window.onerror = function(error, url, line) {
    console.log(error);
};

$(document).on("click","tr.itemRow", function(e){
    let itemID = commonModule.getRowID(e);
    ipcRenderer.send('redirect-window', 'inventoryTransactionDetails.html', [`id=${itemID}`]);
});