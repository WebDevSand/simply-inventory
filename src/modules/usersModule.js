const dbModule = require('./dbModule.js');

exports.usertypePermissions = {
    'viewInventoryTransactions': 'View Inventory Transactions',
    'performInventoryTransactions': 'Perform Inventory Transactions',
    'createGroup': 'Create and Edit Groups',
    'createSubGroup': 'Create and Edit SubGroups',
    'createItem': 'Create and Edit Items',
    'createUOM': 'Create and Edit UOMs',
    'viewValuations': 'View Valuations',
    'createValuations': 'Create and Edit Valuations',
    'viewUsers': 'View Users',
    'createUsers': 'Create and Edit Users',
    'viewUsertypes': 'View Usertypes',
    'createUsertypes': 'Create and Edit Usertypes'
}

exports.getUserByUsername = (username, db, callback) => {
    if(db)
        dbModule.setDB(db);
        
    dbModule.selectQuery(`SELECT * FROM users WHERE username = '${username}'`, (err, result) => {
        if(err) {
            callback(err);
        } else {
            callback('', result);
        }
    });
}

exports.setPassword = (username, password, callback)=>{
    dbModule.update('users', `username='${username}'`, {password}, (err, result)=>{
        if(err)
            callback(err);
        else
            callback('', true);
    });
}

exports.getUsers = (callback)=>{
    dbModule.selectQuery(`SELECT users.*, usertypes.name AS usertypeName 
                            FROM users 
                            INNER JOIN usertypes 
                            WHERE users.usertypeID=usertypes.id
                            ORDER BY username`, (err, result) => {
        if(err) {
            console.log(err);
            callback(err);
        } else {
            callback('', result);
        }
    });
}

exports.getUser = (userID, callback)=>{
    dbModule.selectQuery(`SELECT * FROM users WHERE id = '${userID}'`, (err, result) => {
        if(err) {
            callback(err);
        } else {
            console.log(result);
            callback('', result);
        }
    });
}

exports.getUsertypes = (callback)=>{
    dbModule.selectQuery(`SELECT * FROM usertypes`, (err, result) => {
        if(err) {
            callback(err);
        } else {
            callback('', result);
        }
    });
}

exports.editUser = (userID, data, callback)=>{
    dbModule.update('users', `id='${userID}'`, data, (err, result) => {
        if(err) {
            callback(err);
        } else {
            console.log(result);
            callback('', result);
        }
    });
}

exports.getUsertypeDetails = (usertypeID, callback)=>{
    usertypeQuery = new Promise((resolve, reject)=>{
        dbModule.selectQuery(`SELECT * FROM usertypes WHERE id = '${usertypeID}'`, (err, rows) => {
            if(err) {
                reject(err);
            } else {
                resolve(rows);
            }

        })
    })

    usertypePermissionsQuery = new Promise((resolve, reject)=>{
        dbModule.selectQuery(`SELECT * FROM usertypePermissions WHERE usertypeID = '${usertypeID}'`, (err, rows) => {
            if(err) {
                reject(err);
            } else {
                resolve(rows);
            }

        })
    })

    Promise.all([usertypeQuery, usertypePermissionsQuery])
            .then((results)=>{
                callback('', results);
            })
            .catch((err)=>{
                console.error(err);
                callback(err);
            });
}

exports.updateUsertype = (ID, name, usertypePermissionsArray, callback)=>{
    usertypeNameUpdate = new Promise((resolve, reject)=>{
        let data = {name};
        dbModule.update('usertypes', `id='${ID}'`, data, (err, result) => {
            if(err) {
                callback(err);
            } else {
                console.log(result);
                callback('', result);
            }
        });
    })

    usertypePermissionsUpdate = new Promise((resolve, reject)=>{
        dbModule.delete('usertypePermissions', `usertypeID='${ID}'`, (err, result)=>{
            if(err) {
                callback(err);
            } else {
                // After deleting all entries corresponding to usertypeID, insert one by one
                for(let i in usertypePermissionsArray) {
                    let tempData = {
                            usertypePermission:usertypePermissionsArray[i], 
                            usertypeID: ID
                        };
                    dbModule.insert('usertypePermissions', tempData, (err, result) => {
                        if(err) {
                            console.log(err);
                        } else {
                            console.log('Insert success!');
                        }
                    });
                }


            }
        })
    })

    Promise.all([usertypeNameUpdate, usertypePermissionsUpdate])
            .then((results)=>{
                callback('', results);
            })
            .catch((err)=>{
                console.error(err);
                callback(err);
            });    
}

exports.createUser = (data, callback)=>{
    dbModule.insert('users', data, (err, result) => {
        if(err) {
            console.log(err);
            callback(err);
        } else {
            callback('', result);
        }
    })
}

exports.createUsertype = (data, callback)=>{
    dbModule.insert('usertypes', data, (err, result) => {
        if(err) {
            console.log(err);
            callback(err);
        } else {
            callback('', result);
        }
    })
}

exports.getDBSettings = (callback)=>{
    dbModule.selectQuery(`SELECT * FROM dbSettings`, (err, result) => {
        if(err) {
            callback(err);
        } else {
            // console.log(result);
            callback('', result);
        }
    });
}

exports.saveDBSettings = (name, description, callback)=>{
    dbModule.update('dbSettings', `property='name'`, {'value':name}, (err, result) => {
        if(err) {
            console.log(err);
        } else {

            // Now update description
            dbModule.update('dbSettings', `property='description'`, {'value':description}, (err, result) => {
                if(err) {
                    console.log(err);
                } else {
                    callback('', true);
                }
            });    

        }
    });

}

exports.getPermissions = (usertypeID, callback)=>{
    dbModule.selectQuery(`SELECT * FROM usertypePermissions WHERE usertypeID = '${usertypeID}'`, (err, result) => {
        if(err) {
            callback(err);
        } else {
            callback('', result);
        }
    });
}

exports.checkPermission = (permission1, permission2='', permission3='')=>{
    let userSettings = require('electron').remote.getGlobal('userSettings');
    // console.log(userSettings);
    let userPermissions = Object.keys(userSettings.userPermissions);
    if(userPermissions.indexOf(permission1)!==-1 || userPermissions.indexOf(permission2)!==-1 || userPermissions.indexOf(permission3)!==-1) {
        return true;
    } else {
        return false;
    }
}

exports.getUsertype = ()=>{
    let userSettings = require('electron').remote.getGlobal('userSettings');
    // console.log(userSettings);
    return userSettings.usertypeID;
}