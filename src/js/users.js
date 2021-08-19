const ipcRenderer = require('electron').ipcRenderer;
const path = require('path');
const appPath = require('electron').remote.app.getAppPath();

const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));

$(document).ready(()=>{

    // Load side menu
    commonModule.loadSideMenu('users.html', (err, html)=>{
        $('#menuHolder').html(html);
    });

    if(usersModule.checkPermission('viewUsers', 'createUsers')) {
        console.log('Permission granted: viewUsers or createUsers');
        mainStuff();
    }
});

function mainStuff() {
    // Load users
    usersModule.getUsers((err, rows)=>{
        if(err) {
            $('#usersDiv').html(err);
        } else {
            // Table
            let resultHTML = `<h4><i class="fa fa-user"></i> Users</h4>
                                <div class="text-left">
                                    <button class="btn btn-outline-secondary" onclick="createUser()">
                                        <i class="fa fa-plus"></i> Create User
                                    </button>
                                </div>
                                <br />
                                <table class="table table-sm table-light table-hover">
                                <thead>
                                    <tr>
                                        <th>S.No.</th>
                                        <th>Username</th>
                                        <th>Usertype</th>
                                    </tr>
                                </thead>`;

            for(let i=0 ; i<rows.length ; i++) {
                resultHTML += `<tr class="clickable userRow" id="row_${rows[i].id}">
                                    <td>${i+1}</td>
                                    <td>${rows[i].username}</td>
                                    <td>${rows[i].usertypeName}</td>
                                </tr>`;
            }
            resultHTML += '</table>';
            $('#usersDiv').html(resultHTML);

            $(document).on("click","tr.userRow", function(e){
                let userID = commonModule.getRowID(e);
                ipcRenderer.send('redirect-window', 'usersDialog.html', [`${userID}`]);
            });
            
        }
    });    
}

window.onerror = function(error, url, line) {
    console.log(error);
};

function createUser() {
    ipcRenderer.send('open-new-window', 'usersDialogNew.html', [], 800, 600);
}