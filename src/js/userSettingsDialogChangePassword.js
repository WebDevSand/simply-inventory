const remote = require('electron').remote;
const path = require('path');
const appPath = require('electron').remote.app.getAppPath();
const commonModule = require(path.join(appPath, 'src', 'modules', 'commonModule.js'));
const usersModule = require(path.join(appPath, 'src', 'modules', 'usersModule.js'));


function changePassword() {
    let currentPassword = commonModule.getValidValue('password');
    let newPassword = commonModule.getValidValue('newPassword');
    let newPasswordRepeat = commonModule.getValidValue('newPasswordRepeat');

    if(!currentPassword)
        return false;

    if(newPassword != newPasswordRepeat) {
        alert('Repeat password does not match!');
        return false;
    }

    if(!commonModule.validatePassword(newPassword)) {
        alert('Password should be 6-16 characters and contain atleast one number and one special character');
        return false;
    }

    let username = '';
    commonModule.checkLoggedIn((err, result)=>{
        if(!err)
            username = result;
        console.log(username);
        usersModule.getUserByUsername(username, null, (err, result)=>{
            if(err)
                return false;
            if(commonModule.encryptPassword(currentPassword) == result[0].password) {
                console.log('Password is correct');
                newPassword = commonModule.encryptPassword(newPassword);
                usersModule.setPassword(username, newPassword, (err, result)=>{
                    if(err) {
                        $('#contentDiv').html('Could not set password!');
                        console.log(err);
                    } else {
                        alert('Password changed successfully!');
                        cancelDialog();
                    }
                })
            }
        })
    });
}

function cancelDialog() {
    remote.getCurrentWindow()
        .close();
}