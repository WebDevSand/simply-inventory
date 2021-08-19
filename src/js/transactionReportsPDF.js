const ipcRenderer = require('electron').ipcRenderer;

const path = require('path');
const appPath = require('electron').remote.app.getAppPath();
const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const inventoryModule = require(path.join(appPath, 'src', 'modules', 'inventoryModule.js'));
const moment = require('moment');

var startDate, endDate, itemID;

$(document).ready(()=>{

    // Load side menu
    commonModule.loadSideMenu('transactionReports.html', (err, html)=>{
        $('#menuHolder').html(html);
    });

    ipcRenderer.send('variable-request');

    ipcRenderer.on('variable-reply', function (event, args) {
        [startDate, endDate, itemID] = args;

        if(!startDate || !endDate || !itemID) {
            $('#contentDiv').html('Could not load data!');
        } else {
            startDate = moment(startDate, 'DD-MM-YYYY');
            endDate = moment(endDate, 'DD-MM-YYYY');
            inventoryModule.getItemTransactionDetails(itemID, startDate.unix(), endDate.unix(), (err, result)=>{
                if(err) {
                    console.error(err);
                    $('#contentDiv').html('Error loading data!');
                } else {
                    console.log(result);
                    let openingStock = result[0][0].openingStock;
                    if(!openingStock)
                        openingStock = 0;
                    let transactions = result[1];
                    let uom = result[2][0];
    
                    let resultHTML = `<div class="text-center printButton">
                                            <button class="btn btn-outline-primary" onclick="commonModule.exportPDF('transaction_report')">
                                                <i class="fa fa-file-pdf-o"></i> Export PDF
                                            </button>
                                            <button class="btn btn-outline-primary" onclick="commonModule.printPage()">
                                                <i class="fa fa-print"></i> Print
                                            </button>
                                        </div>
                                        <h4>${uom.itemName}</h4>
                                        <div id="itemGroupDetails"></div>
                                        <br />
                                        <h5>Inventory transactions from ${startDate.format('DD-MM-YYYY')} to ${endDate.format('DD-MM-YYYY')}</h5>
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
                                                    <td>${startDate.format('DD-MM-YYYY')}</td>
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
                                            <td>${moment.unix(transactions[key].datetime).format('DD-MM-YYYY')}</td>
                                            <td></td>
                                            <td class="text-right">${(receipts ? commonModule.uomFormat(receipts, uom) : '')}${tempValue}</td>
                                            <td class="text-right">${(issues ? commonModule.uomFormat(issues, uom) : '')}</td>
                                            <td class="text-right">${commonModule.uomFormat(closingStock, uom)}</td>
                                            <td class="text-left smallFont">${comments}</td>
                                            <td class="text-center smallFont">${transactions[key].username}</td>
                                        </tr>`;
                    }
                    resultHTML += `<tr>
                                        <td>${endDate.format('DD-MM-YYYY')}</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td class="text-right"><b>${commonModule.uomFormat(closingStock, uom)}</b></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    </tbody>
                                </table>
                                <div class="text-center printButton">
                                    <button class="btn btn-outline-primary" onclick="commonModule.exportPDF('transaction_report')">
                                        <i class="fa fa-file-pdf-o"></i> Export PDF
                                    </button>
                                </div>`;
                    $('#contentDiv').html(resultHTML);
    
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
        }
    });    
});