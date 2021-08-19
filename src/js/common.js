let getQuickMenu = require(require('path').join(appPath, 'src', 'modules', 'commonModule.js')).getQuickMenu;

$(document).ready(()=>{
    
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });
    
    let userSettings = require('electron').remote.getGlobal('userSettings');
    // console.log(userSettings);
    console.log('Setting font size to '+userSettings.fontSize+'px');
    $(document.body).css('fontSize', userSettings.fontSize+'px');

    getQuickMenu((err, data)=>{
        if(err) {
            console.log(err);
            $('#quickMenuHolder').html('Error fetching data');
        } else {
            $('#quickMenuHolder').html(data);

            $(function () {
                $('[data-toggle="tooltip"]').tooltip();
            });
        }
    })

    let version = require('electron').remote.getGlobal('userSettings').version;
    $('#versionHolder').html('ver '+version)
})

function openExternal(address) {
    require('electron').remote.shell.openExternal(address);
}