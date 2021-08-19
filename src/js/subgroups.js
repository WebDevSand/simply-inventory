const ipcRenderer = require('electron').ipcRenderer;
const path = require('path');
const appPath = require('electron').remote.app.getAppPath();
const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const inventoryModule = require(path.join(appPath, 'src', 'modules', 'inventoryModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));

$(document).ready(()=>{

    // Load side menu
    commonModule.loadSideMenu('subgroups.html', (err, html)=>{
        $('#menuHolder').html(html);
    });

    if(usersModule.checkPermission('viewInventoryTransactions', 'createSubGroup')) {
        console.log('Permission granted: viewInventoryTransactions or createSubGroup');
        mainStuff();
    }
});

function mainStuff() {
    inventoryModule.getGroupsAndSubgroups((err, result) => {
        if(err) {
            $('#contentDiv').html('Error fetching data!');
            console.log(err);
        } else {
            let groups = result[0];
            let subgroups = result[1];
            let groupsArray = [];
            for(let i in groups) {
                if(groups[i].id)
                    groupsArray[groups[i].id] = groups[i].name;
            }

            let resultHTML = `<h4><i class="fa fa-dot-circle-o"></i> Subgroups</h4>
                            <div class="text-left">
                                <button class="btn btn-outline-secondary" onclick="newSubgroup()">
                                    <i class="fa fa-plus-circle"></i> New Subgroup
                                </button>
                            </div>
                            <br />
                            <table class="table table-sm table-light table-hover">
                                <thead>
                                    <tr>
                                        <th>S.No.</th>
                                        <th>Subgroup</th>
                                        <th>Group</th>
                                    </tr>
                                </thead>
                                <tbody>`;

            let count = 0;
            for(let key in subgroups) {
                if(subgroups[key].id) {
                    count++;
                    resultHTML += `<tr class="groupRow clickable" id="row_${subgroups[key].id}">
                                        <td>${count}</td>
                                        <td>${subgroups[key].name}</td>
                                        <td>${groupsArray[subgroups[key].groupID]}</td>
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
    ipcRenderer.send('open-new-window', 'subgroupsDialog.html', [`id=${groupID}`], 800, 600);
});

window.onerror = function(error, url, line) {
    ipcRenderer.send('error-in-window', error);
};

function newSubgroup() {
    ipcRenderer.send('open-new-window', 'subgroupsDialogNew.html', [], 800, 600);
}