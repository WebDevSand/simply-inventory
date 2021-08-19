const ipcRenderer = require('electron').ipcRenderer;

const path = require('path');
const app = require('electron').remote.app;
const fs = require('fs');
const appPath = require('electron').remote.app.getAppPath();
const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));
const excelModule = require(path.join(appPath, 'src', 'modules', 'excelModule.js'));
const inventoryModule = require(path.join(appPath, 'src', 'modules', 'inventoryModule.js'));
const moment = require('moment');

var startDate, endDate, itemID;
var groupName, subgroupName;

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
    
                    let resultHTML = `<h4>${uom.itemName}</h4>
                                        <div id="itemGroupDetails"></div>
                                        <div style="padding-top:10px">
                                            <button class="btn btn-outline-secondary" id="receiptButton">
                                                <i class="fa fa-plus-circle"></i> Receipt
                                            </button>
                                            <button class="btn btn-outline-secondary" id="issueButton">
                                                <i class="fa fa-minus-circle"></i> Issue
                                            </button>
                                            <button class="btn btn-outline-secondary" id="pdfButton">
                                                <i class="fa fa-file-pdf-o"></i> Export PDF
                                            </button>
                                            <button class="btn btn-outline-secondary" id="printButton">
                                                <i class="fa fa-print"></i> Print
                                            </button>
                                            <button class="btn btn-outline-secondary" id="excelButton">
                                                <i class="fa fa-file-excel-o"></i> Export to Excel
                                            </button>
                                        </div>
                                        <br />
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
                                </table>`;
                    $('#contentDiv').html(resultHTML);
    
                    // Receipt button
                    $('#receiptButton').on('click', (e)=>{
                        ipcRenderer.send('open-new-window', 'inventoryTransactionDialogNew.html', ['id='+itemID,'receipt='+true, 'itemName='+uom.itemName, 'month='+startDate.format('YYYY-MM-DD')]);
                    })
    
                    // Issue button
                    $('#issueButton').on('click', (e)=>{
                        ipcRenderer.send('open-new-window', 'inventoryTransactionDialogNew.html', ['id='+itemID,'receipt='+false, 'itemName='+uom.itemName, 'month='+startDate.format('YYYY-MM-DD')]);
                    })

                    // PDF button
                    $('#pdfButton').on('click', (e)=>{
                        ipcRenderer.send('open-new-window', 'transactionReportsPDF.html', ['id='+itemID,'receipt='+true, 'itemName='+uom.itemName, 'month='+startDate.format('YYYY-MM-DD')]);
                    })

                    // Print button
                    $('#printButton').on('click', (e)=>{
                        ipcRenderer.send('open-new-window', 'transactionReportsPDF.html', ['id='+itemID,'receipt='+true, 'itemName='+uom.itemName, 'month='+startDate.format('YYYY-MM-DD')]);
                    })

                    // Print button
                    $('#excelButton').on('click', (e)=>{
                        exportToExcel();                        
                    })
    
                    // Load itemGroupDetails
                    inventoryModule.getSubgroup(uom.subgroupID, (err, result)=>{
                        if(err) {
                            $('#itemGroupDetails').html('Error loading data!');
                        } else {
                            groupName = result[0].groupName;
                            subgroupName = result[0].name;
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
}

function exportToExcel() {
    inventoryModule.getItemTransactionDetails(itemID, startDate.unix(), endDate.unix(), (err, result)=>{
        if(err) {
            console.error(err);
            $('#contentDiv').html('Error loading data!');
        } else {
            let openingStock = result[0][0].openingStock;
            if(!openingStock)
                openingStock = 0;
            let closingStock = openingStock;
            let transactions = result[1];
            let uom = result[2][0];

            let xl = require('excel4node');
            var wb = new xl.Workbook();
            var ws = wb.addWorksheet('Inventory Transactions');

            let row = 1;
            let boldStyle = excelModule.getStyle(wb,'#000000','12pt',true);
            ws.cell(row, 1)
                .string('Item: ');
            ws.cell(row, 2)
                .string(uom.itemName)
                .style(boldStyle);

            row++;
            ws.cell(row, 1)
                .string('Subgroup: ');
            ws.cell(row, 2)
                .string(subgroupName)
                .style(boldStyle);

            row++;
            ws.cell(row, 1)
                .string('Group: ');
            ws.cell(row, 2)
                .string(groupName)
                .style(boldStyle);

            row++;
            row++;
            ws.cell(row, 1)
                .string('Inventory Transactions from '+startDate.format('DD-MM-YYYY')+' to '+endDate.format('DD-MM-YYYY'))
                .style(boldStyle);

            row++;
            row++;
            let items = ['Date', 'Opening Stock', 'Receipts', 'Issues', 'Closing Stock', 'Comments', 'Username', 'Purchase details'];
            for(let i in items) {
                ws.cell(row, (parseInt(i)+1))
                    .string(items[i])
                    .style(boldStyle);
            }

            let numberStyleBold = excelModule.getNumberStyle(wb, uom.roundoff, true);

            row++;
            ws.cell(row, 1)
                .string(startDate.format('DD-MM-YYYY'));
            ws.cell(row, 2)
                .number(openingStock)
                .style(numberStyleBold);


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
                    tempValue += `@ ${commonModule.currencyFormat(transactions[key].unitValue)}`;
                }

                let comments = '';
                if(transactions[key].comments) {
                    comments = transactions[key].comments;
                }

                // Each row of transaction
                items = {
                            1: {string: moment.unix(transactions[key].datetime).format('DD-MM-YYYY')},
                            2: {string: ''},
                            3: {number: (receipts ? receipts : '')+''},
                            4: {number: (issues ? issues : '')+''},
                            5: {number: closingStock+''},
                            6: {string: comments},
                            7: {string: transactions[key].username},
                            8: {string: tempValue}
                        };
                row++;
                let numberStyle = excelModule.getNumberStyle(wb, uom.roundoff);
                ws = excelModule.objectToExcelRows(ws, row, items, numberStyle);
            }

            row++;
            ws.cell(row, 1)
                .string(endDate.format('DD-MM-YYYY'));
            ws.cell(row, 5)
                .number(closingStock)
                .style(numberStyleBold);
            
        
            let exportPath = commonModule.getDefaultExportPath();
            let fileName = 'transaction_report_' + moment().format('_YYYY_MM_DD-HH_mm_ss');
            fileName += '.xlsx';
            exportPath = path.join(exportPath, fileName);
            wb.write(exportPath, (err, stats)=>{
                console.log(path.normalize(exportPath));
                // require('electron').remote.shell.openItem(path.normalize(exportPath));
                require('electron').remote.shell.showItemInFolder(path.normalize(exportPath));
            });
        }
    });
}