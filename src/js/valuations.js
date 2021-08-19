const ipcRenderer = require('electron').ipcRenderer;
const moment = require('moment');
const path = require('path');
const appPath = require('electron').remote.app.getAppPath();

const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const inventoryModule = require(path.join(appPath, 'src', 'modules', 'inventoryModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));

$(document).ready(()=>{

    // Load side menu
    commonModule.loadSideMenu('valuations.html', (err, html)=>{
        $('#menuHolder').html(html);
    });

    if(usersModule.checkPermission('viewValuations', 'createValuations')) {
        console.log('Permission granted: viewValuations or createValuations');
        mainStuff();
    }
});

function mainStuff() {
    inventoryModule.getSavedValuations(function(err, result) {
        if(err) {
            console.log(err);
            $('#contentDiv').html('Error occured!');
        } else {
            let resultHTML = `<h4><i class="fa fa-usd"></i> Saved Valuations</h4>
                                <table class="table table-sm table-light table-hover">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Comments</th>
                                        <th class="text-right">Total Value</th>
                                    </tr>
                                </thead>
                                <tbody>`;
            for(let key in result) {
                let tempDate = moment.unix(result[key].date).format('DD MMM, YYYY');
                // let tempDate = '';
                resultHTML += `<tr class="clickable valuationRow" id="row_${result[key].id}">
                                    <td>${tempDate}</td>
                                    <td>${result[key].comments}</td>
                                    <td class="text-right">${commonModule.currency(result[key].totalValue)}</td>
                                </tr>`;
            }
            resultHTML += `</tbody></table>`;
            $('#contentDiv').html(resultHTML);

            $(document).on("click","tr.valuationRow", function(e){
                let valuationID = commonModule.getRowID(e);
                ipcRenderer.send('redirect-window', 'valuationsView.html', [`${valuationID}`]);
            });
        }
    });    
}

window.onerror = function(error, url, line) {
    console.log(error);
};