const ipcRenderer = require('electron').ipcRenderer;
const path = require('path');
const appPath = require('electron').remote.app.getAppPath();
const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const inventoryModule = require(path.join(appPath, 'src', 'modules', 'inventoryModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));

$(document).ready(()=>{

    // Load side menu
    commonModule.loadSideMenu('uom.html', (err, html)=>{
        $('#menuHolder').html(html);
    });

    if(usersModule.checkPermission('viewInventoryTransactions', 'createUOM')) {
        console.log('Permission granted: viewInventoryTransactions or createUOM');
        mainStuff();
    }
});

function mainStuff() {
    inventoryModule.getUOMs((err, result) => {
        if(err) {
            $('#contentDiv').html('Error fetching data!');
            console.log(err);
        } else {
            let resultHTML = `<h4><i class="fa fa-balance-scale"></i> UOM</h4>
                            <div class="text-left">
                                <button class="btn btn-outline-secondary" onclick="newUOM()">
                                    <i class="fa fa-plus-circle"></i> New UOM
                                </button>
                            </div>
                            <br />
                            <table class="table table-sm table-light table-hover">
                                <thead>
                                    <tr>
                                        <th>S.No.</th>
                                        <th>Name</th>
                                        <th>Prefix</th>
                                        <th>Roundoff</th>
                                        <th>Postfix</th>
                                    </tr>
                                </thead>
                                <tbody>`;

            let count = 0;
            for(let key in result) {
                if(result[key].id) {
                    count++;
                    resultHTML += `<tr class="uomRow clickable" id="row_${result[key].id}">
                                        <td>${count}</td>
                                        <td>${result[key].name}</td>
                                        <td>${result[key].prefix}</td>
                                        <td>${result[key].roundoff}</td>
                                        <td>${result[key].postfix}</td>
                                    </tr>`;
                }
            }
            resultHTML += `</tbody>
                    </table>`;
            $('#contentDiv').html(resultHTML);
        }
    });    
}

$(document).on("click","tr.uomRow", function(e){
    let uomID = commonModule.getRowID(e);
    ipcRenderer.send('open-new-window', 'uomsDialog.html', [`id=${uomID}`], 800, 600);
});

window.onerror = function(error, url, line) {
    ipcRenderer.send('error-in-window', error);
};

function newUOM() {
    ipcRenderer.send('open-new-window', 'uomsDialogNew.html', [], 800, 600);
}