const ipcRenderer = require('electron').ipcRenderer;
const path = require('path');
const appPath = require('electron').remote.app.getAppPath();
const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));

$(document).ready(()=>{
    // Load side menu
    commonModule.loadSideMenu('userSettings.html', (err, html)=>{
        $('#menuHolder').html(html);
    });

    // Load font size
    let currentSize = require('electron').remote.getGlobal('userSettings').fontSize;
    $('#fontSize').val(currentSize);
});

window.onerror = function(error, url, line) {
    console.log(error);
};

function changePassword() {
    ipcRenderer.send('open-new-window', 'userSettingsDialogChangePassword.html', [], 600, 600);
}