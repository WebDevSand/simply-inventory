const moment = require('moment');
const ipcRenderer = require('electron').ipcRenderer;
const path = require('path');
const appPath = require('electron').remote.app.getAppPath();

const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const inventoryModule = require(path.join(appPath, 'src', 'modules', 'inventoryModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));

let username;

commonModule.checkLoggedIn((err, user)=>{
    if(err) {
        ipcRenderer.send('redirect-window', 'login.html', []);
    } else {
        username = user;
    }
})

$(document).ready(()=>{

    // Load side menu
    commonModule.loadSideMenu('valuationsNew.html', (err, html)=>{
        $('#menuHolder').html(html);
    });

    if(usersModule.checkPermission('createValuations')) {
        console.log('Permission granted: createValuations');
        mainStuff();
    }
});

function mainStuff() {
    let lastValuationOptions = '';
    inventoryModule.getSavedValuations((err, result)=>{
        if(err) {
            console.log(err);
        } else {
            for(let i in result) {
                lastValuationOptions += `<option value="${result[i].id}">${moment.unix(result[i].date).format('DD MMM, YYYY')} - ${result[i].comments}</option>`;
            }

            let resultHTML = `<h4><i class="fa fa-usd"></i> New Valuation</h4>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-4 col-lg-4 text-right">
                                        <label class="col-form-label">Date</label>
                                    </div>
                                    <div class="col-md-6 col-lg-6">
                                        <input type="text" id="date" value="" class="form-control" />
                                    </div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-4 col-lg-4 text-right">
                                        <label class="col-form-label">Comment/Description</label>
                                    </div>
                                    <div class="col-md-6 col-lg-6">
                                        <input type="text" id="comments" value="" class="form-control" />
                                    </div>
                                </div>
                                <div class="form-group row" style="width:100%;">
                                    <div class="col-md-4 col-lg-4 text-right">
                                        <label class="col-form-label">Last Valuation</label>
                                    </div>
                                    <div class="col-md-6 col-lg-6">
                                        <select id="lastValuationID" class="form-control">
                                            ${lastValuationOptions}
                                        </select>
                                    </div>
                                </div>
                                <div class="container text-center" style="width:100%">
                                    <button class="btn btn-outline-secondary" id="editGroup" onclick="createValuation()">
                                        <i class="fa fa-save"></i> Save Changes & View Closing Stock</button>
                                </div>`;
                $('#contentDiv').html(resultHTML);

                $('#date').datetimepicker({
                    timepicker: false,
                    format: 'd-m-Y'
                });
        }
    })    
}

window.onerror = function(error, url, line) {
    console.log(error);
};

function createValuation() {
    let date = commonModule.getValidValue('date');
    let comments = commonModule.getValidValue('comments');
    let lastValuationID = commonModule.getValidValue('lastValuationID');
    if(!date || !comments)
        return false;

    if(($('#lastValuationID').children().length != 0) && !lastValuationID)
        return false;

    let data = {date:moment(date,'DD-MM-YYYY').unix(), comments, lastValuationID};
    inventoryModule.createValuation(data, (err, valuationID)=>{
        if(err) {
            console.error(err);
            $('#contentDiv').html('Could not save data!');
        } else {
            ipcRenderer.send('redirect-window', 'valuationsEdit.html', [`${valuationID}`]);
        }
    })
}