const ipcRenderer = require('electron').ipcRenderer;
const appPath = require('electron').remote.app.getAppPath();

const path = require('path');
const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const inventoryModule = require(path.join(appPath, 'src', 'modules', 'inventoryModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));

$(document).ready(()=>{

    // Load side menu
    commonModule.loadSideMenu('groups.html', (err, html)=>{
        $('#menuHolder').html(html);
    });

    if(usersModule.checkPermission('viewInventoryTransactions', 'createGroup')) {
        console.log('Permission granted: viewInventoryTransactions or createGroup');
        mainStuff();
    }
});

function mainStuff() {
    inventoryModule.getGroups((err, result) => {
        if(err) {
            $('#contentDiv').html('Error fetching data!');
            console.log(err);
        } else {
            let resultHTML = `<h4><i class="fa fa-folder-open"></i> Groups</h4>
                            <div class="text-left">
                                <button class="btn btn-outline-secondary" onclick="newGroup()">
                                    <i class="fa fa-plus-circle"></i> New Group
                                </button>
                            </div>
                            <br />
                            <table class="table table-sm table-light table-hover">
                                <thead>
                                    <tr>
                                        <th>S.No.</th>
                                        <th>Name</th>
                                    </tr>
                                </thead>
                                <tbody>`;

            let count = 0;
            for(let key in result) {
                if(result[key].id) {
                    count++;
                    resultHTML += `<tr class="groupRow clickable" id="row_${result[key].id}">
                                        <td>${count}</td>
                                        <td>${result[key].name}</td>
                                    </tr>`;
                }
            }
            resultHTML += `</tbody>
                    </table>`;
            $('#contentDiv').html(resultHTML);
        }
    })    
}

$(document).on("click","tr.groupRow", function(e){
    let groupID = commonModule.getRowID(e);
    ipcRenderer.send('open-new-window', 'groupsDialog.html', [`id=${groupID}`], 800, 600);
});

window.onerror = function(error, url, line) {
    ipcRenderer.send('error-in-window', error);
};

function newGroup() {
    ipcRenderer.send('open-new-window', 'groupsDialogNew.html', [], 800, 600);
}