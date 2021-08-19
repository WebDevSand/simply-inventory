const dbModule = require('./dbModule.js');
const util = require('util');
var selectQuery = util.promisify(dbModule.selectQuery);

exports.getCurrentInventory = (callback) => {
    let groupsQuery = selectQuery('SELECT * FROM groups');
    let subgroupsQuery = selectQuery('SELECT * FROM subgroups');
    let itemsQuery = selectQuery('SELECT * FROM items');
    let uomQuery = selectQuery('SELECT * FROM uom');

    let inventoryQuery = new Promise((resolve, reject) => {
        dbModule.selectQuery('SELECT itemID, SUM(receipts) as closingStock FROM entries GROUP BY itemID', function(err, rows) {
            if(err) {
                reject(err);
            } else {
                let inventoryResult = [];
                for(let key in rows) {
                    inventoryResult[rows[key].itemID] = rows[key].closingStock;
                }
                resolve(inventoryResult);
            }
        });
    });

    Promise.all([groupsQuery, subgroupsQuery, itemsQuery, inventoryQuery, uomQuery])
            .then((results)=>{
                callback('', results);
            })
            .catch((err)=>{
                callback(err);
            });

}

exports.getGroups = (callback) => {
    dbModule.selectQuery('SELECT * FROM groups ORDER BY name ASC', function(err, rows) {
        callback(err, rows);
    });    
}

exports.getSubgroups = (callback) => {
    dbModule.selectQuery('SELECT * FROM subgroups ORDER BY name ASC', function(err, rows) {
        callback(err, rows);
    });    
}

exports.getGroup = (groupID, callback) => {
    dbModule.selectQuery('SELECT * FROM groups WHERE id = '+groupID, function(err, rows) {
        console.log(rows);
        callback(err, rows);
    });
}

exports.editGroup = (groupID, data, callback) => {
    dbModule.update('groups', 'id='+groupID, data, function(err, result) {
        callback(err, result);
    });
}

exports.createGroup = (data, callback) => {
    dbModule.insert('groups', data, function(err, result) {
        callback(err, result);
    });
}

exports.createSubgroup = (data, callback) => {
    dbModule.insert('subgroups', data, function(err, result) {
        callback(err, result);
    });
}

exports.createItem = (data, callback) => {
    dbModule.insert('items', data, function(err, result) {
        callback(err, result);
    });
}

exports.editItem = (itemID, data, callback) => {
    dbModule.update('items', 'id='+itemID, data, function(err, result) {
        callback(err, result);
    });
}

exports.createUOM = (data, callback) => {
    dbModule.insert('uom', data, function(err, result) {
        callback(err, result);
    });
}

exports.editSubgroup = (subgroupID, data, callback) => {
    dbModule.update('subgroups', 'id='+subgroupID, data, function(err, result) {
        callback(err, result);
    });
}

exports.getGroupsAndSubgroups = (callback) => {
    let groupsQuery = selectQuery('SELECT * FROM groups');
    let subgroupsQuery = selectQuery('SELECT * FROM subgroups ORDER BY groupID ASC');

    Promise.all([groupsQuery, subgroupsQuery])
            .then((results)=>{
                callback('', results);
            })
            .catch((err)=>{
                callback(err);
            });
}

exports.getSubgroup = (subgroupID, callback) => {
    dbModule.selectQuery(`SELECT subgroups.id, subgroups.name, subgroups.groupID, groups.name AS groupName 
                            FROM subgroups INNER JOIN groups ON subgroups.groupID = groups.id WHERE subgroups.id=${subgroupID}`, (err, rows) => {
        if(err) {
            callback(err);
        } else {
            if(Object.keys(rows).length == 0) {
                dbModule.selectQuery('SELECT * FROM subgroups WHERE id = '+subgroupID, (err, rows)=>{
                    if(err)
                        callback(err);
                    else
                        callback('', rows);
                })
            } else {
                callback('', rows);
            }
                
            
        }
    });
}

exports.getSubgroupForEdit = (subgroupID, callback) => {
    let groupsQuery = selectQuery('SELECT * FROM groups');
    let subgroupsQuery = selectQuery(`SELECT * FROM subgroups WHERE id = '${subgroupID}'`)

    Promise.all([groupsQuery, subgroupsQuery])
            .then((results)=>{
                callback('', results);
            })
            .catch((err)=>{
                callback(err);
            });
}

exports.getItems = (callback) => {
    let groupsQuery = selectQuery('SELECT * FROM groups');
    let subgroupsQuery = selectQuery('SELECT * FROM subgroups');
    let itemsQuery = selectQuery('SELECT items.*, uom.name AS uomName FROM items INNER JOIN uom ON uom.id=items.uomID')

    Promise.all([groupsQuery, subgroupsQuery, itemsQuery])
            .then((results)=>{
                callback('', results);
            })
            .catch((err)=>{
                callback(err);
            });

}

exports.getItem = (itemID, callback) => {
    dbModule.selectQuery(`SELECT items.*, uom.name AS uomName, uom.prefix, uom.postfix, uom.roundoff FROM items 
                            INNER JOIN uom ON items.uomID=uom.id 
                            WHERE items.id = ${itemID}`, (err, rows) => {
        if(err) {
            callback(err);
        } else {
            let subgroupID = rows[0].subgroupID;
            if(subgroupID!=0) {
                dbModule.selectQuery(`SELECT subgroups.id, subgroups.name, subgroups.groupID, groups.name AS groupName FROM subgroups 
                                        INNER JOIN groups ON subgroups.groupID = groups.id 
                                        WHERE subgroups.id=${subgroupID}`, (err, subgroupDetails) => {
                    if(err) {
                        callback(err)
                    } else {
                        let result = [rows, subgroupDetails];
                        callback('', result);
                    }
                });
            } else {
                callback('', rows);
            }
        }
    });
}

exports.getItemForEdit = (itemID, callback) => {
    let itemsQuery = selectQuery(`SELECT * FROM items WHERE id = '${itemID}'`);
    let subgroupsQuery = selectQuery(`SELECT subgroups.id, subgroups.name, subgroups.groupID, groups.name AS groupName 
                                        FROM subgroups INNER JOIN groups ON subgroups.groupID = groups.id 
                                        ORDER BY subgroups.groupID`);
    let uomQuery = selectQuery('SELECT * FROM uom');

    Promise.all([itemsQuery, subgroupsQuery, uomQuery])
            .then((results)=>{
                callback('', results);
            })
            .catch((err)=>{
                callback(err);
            });
}

exports.getUOMs = (callback) => {
    dbModule.selectQuery('SELECT * FROM uom ORDER BY name ASC', (err, result) => {
        if(err) {
            callback(err);
        } else {
            callback('', result);
        }
    });
}

exports.getUOM = (uomID, callback)=>{
    dbModule.selectQuery(`SELECT * FROM uom WHERE id = '${uomID}'`, (err, result) => {
        if(err) {
            callback(err);
        } else {
            callback('', result);
        }
    });
}

exports.editUOM = (uomID, data, callback) => {
    dbModule.update('uom', 'id='+uomID, data, function(err, result) {
        callback(err, result);
    });
}

exports.getItemTransactionDetails = (itemID, fromDate, toDate, callback) => {
    let openingStockQuery = selectQuery(`SELECT itemID, SUM(receipts) AS openingStock FROM entries 
                                WHERE itemID = '${itemID}' AND datetime < '${fromDate}'`);
    let transactionsQuery = selectQuery(`SELECT * FROM entries WHERE itemID = '${itemID}' AND datetime >= '${fromDate}' AND datetime <= '${toDate}' ORDER BY datetime ASC`);
    let uomQuery = selectQuery(`SELECT uom.*, items.subgroupID, items.name AS itemName FROM uom 
                        INNER JOIN items ON  items.uomID = uom.id
                        WHERE items.id = '${itemID}'`);

    Promise.all([openingStockQuery, transactionsQuery, uomQuery])
            .then((results)=>{
                callback('', results);
            })
            .catch((err)=>{
                callback(err);
            });
}

exports.newTransaction = (data, callback)=>{
    dbModule.insert('entries', data, function(err, result) {
        callback(err, result);
    });
}

exports.getGroupsSubgroupsAndUOMs = (callback) => {
    let groupsQuery = selectQuery('SELECT * FROM groups');
    let subgroupsQuery = selectQuery('SELECT * FROM subgroups ORDER BY groupID ASC');
    let uomQuery = selectQuery('SELECT * FROM uom');

    Promise.all([groupsQuery, subgroupsQuery, uomQuery])
            .then((results)=>{
                callback('', results);
            })
            .catch((err)=>{
                callback(err);
            });
}

exports.getSavedValuations = (callback)=>{
    dbModule.selectQuery('SELECT * FROM valuations ORDER BY date DESC', (err, rows) => {
        if(err) {
            callback(err);
        } else {
            callback('', rows);
        }
    });
}

exports.getValuationDetails = (valuationID, callback)=>{
    if(!valuationID) {
        let tempResult = {
            0: {
                date: 0
            }
        }
        callback('', tempResult);
    } else {
        dbModule.selectQuery(`SELECT * FROM valuations WHERE id = '${valuationID}'`, (err, rows) => {
            if(err) {
                callback(err);
            } else {
                callback('', rows);
            }
        });
    }
}

exports.createValuation = (data, callback)=>{
    dbModule.insert('valuations', data, function(err, result) {
        if(err) {
            callback(err);
        } else {
            // Get insert ID
            dbModule.selectQuery(`SELECT id FROM valuations WHERE date = '${data.date}' AND comments = '${data.comments}'`, (err, rows) => {
                if(err) {
                    callback(err);
                } else {
                    callback('', rows[0].id);
                }
            });
        }
    });
}

exports.editValuation = (valuationID, data, callback)=>{
    dbModule.update('valuations', `id='${valuationID}'`, data, callback);
}

exports.getValuation = (valuationID, callback)=>{
    let valuationQuery = selectQuery(`SELECT * FROM valuations WHERE id = '${valuationID}'`);
    let valuationItemsQuery = selectQuery(`SELECT * FROM valuationItems WHERE valuationID = '${valuationID}'`);
    let itemsQuery = selectQuery(`SELECT items.*, subgroups.name AS subgroupName, groups.name AS groupName 
                                FROM items INNER JOIN subgroups, groups 
                                WHERE items.subgroupID=subgroups.id AND subgroups.groupID=groups.id
                                ORDER BY subgroupID ASC`);
    let uomsQuery = selectQuery(`SELECT * FROM uom`);
    Promise.all([valuationQuery, valuationItemsQuery, itemsQuery, uomsQuery])
            .then((results)=>{
                callback('', results);
            })
            .catch((err)=>{
                console.error(err);
                callback(err);
            });
}

exports.getValuationItemWise = (openingDate, closingDate, callback)=>{
    // Get opening stock
    let openingQuery = selectQuery(`SELECT SUM(receipts) AS openingStock, itemID, unitValue FROM entries WHERE datetime < '${openingDate}' GROUP BY itemID`);

    // Get closing stock
    let closingQuery = selectQuery(`SELECT SUM(receipts) AS closingStock, itemID FROM entries WHERE datetime < ${closingDate} GROUP BY itemID`);

    // Get receipts from openignDate(including) to closingDate(excluding)
    let receiptsQuery = selectQuery(`SELECT receipts, datetime, unitValue, itemID 
                                FROM entries 
                                WHERE datetime > '${openingDate}' AND datetime < '${closingDate}' AND receipts>0 
                                ORDER BY itemID`);

    // Get receipts from openignDate(including) to closingDate(excluding)
    let issuesQuery = selectQuery(`SELECT SUM(receipts) AS totalIssues, itemID 
                                FROM entries 
                                WHERE datetime > '${openingDate}' AND datetime < '${closingDate}' AND receipts<0 
                                GROUP BY itemID`);

    Promise.all([openingQuery, closingQuery, receiptsQuery, issuesQuery])
        .then((results)=>{
            callback('', results);
        })
        .catch((err)=>{
            console.log(err);
            callback(err);
        });
}

exports.saveValuationItem = (valuationID, data, callback)=>{
    dbModule.selectQuery(`SELECT * FROM valuationItems WHERE valuationID = '${valuationID}' AND itemID = '${data.itemID}'`, (err, rows)=>{
        if(err) {
            callback(err);
        } else {
            if(Object.keys(rows).length==0) {
                // No such entry - go ahead and save
                data.valuationID = valuationID;
                dbModule.insert('valuationItems', data, (err, result)=>{
                    if(err) {
                        callback(err);
                    } else {
                        callback('', true);
                    }
                })
            } else {
                // Entry already exists - Update
                dbModule.update('valuationItems', `valuationID = '${valuationID}' AND itemID = '${data.itemID}'`, data, (err, result)=>{
                    if(err) {
                        callback(err);
                    } else {
                        callback('', true);
                    }
                })
            }
        }
    })
}

exports.deleteValuation = (valuationID, callback)=>{
    dbModule.delete('valuationItems', `valuationID='${valuationID}'`, (err, result)=>{
        if(err) {
            console.log(err);
            callback(err);
        } else {
            dbModule.delete('valuations', `id='${valuationID}'`, (err, result)=>{
                if(err) {
                    console.log(err);
                    callback(err);
                } else {
                    callback('', true);
                }
            })
        }
    })
}