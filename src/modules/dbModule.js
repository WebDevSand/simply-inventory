const sqlite3 = require('sqlite3').verbose();
let dbName = require('electron').remote.getGlobal('userSettings').db;
// const dbName = 'skeleton.db';

exports.setDB = (newDBName)=>{
    dbName = newDBName;
}

exports.selectQuery = (query, callback) => {

    let db = new sqlite3.Database(dbName, sqlite3.OPEN_READWRITE, (err)=>{
        if(err) {
            callback(err, null);
        }
    });

    db.serialize(() => {
        var resultHTML;
        db.all(query, (err, rows) => {
            if (err) {
                callback(err, null);
            }
            callback(null, rows);
        });
    });    

    // close the DB
    db.close((err) => {
        if (err) {
            callback(err);
        }
    });
}

exports.update = (tableName, whereCondition, dataObject, callback) => {

    let db = new sqlite3.Database(dbName, sqlite3.OPEN_READWRITE, (err)=>{
        if(err) {
            callback(err, null);
        }
    });

    // Prepare dataSet
    let dataSet = '';
    for(let key in dataObject) {
        if(dataSet!='')
            dataSet += ', ';
        dataSet += `${key}='${dataObject[key]}'`;
    }

    console.log(`UPDATE ${tableName} SET ${dataSet} WHERE ${whereCondition}`);
    db.run(`UPDATE ${tableName} SET ${dataSet} WHERE ${whereCondition}`, [], (err, result) => {

        if(err)
            callback(err, null);
        else
            callback('', 'success');
    });

    // close the DB
    db.close((err) => {
        if (err) {
            callback(err);
        }
    });

}

exports.insert = (tableName, data, callback) => {

    let db = new sqlite3.Database(dbName, sqlite3.OPEN_READWRITE, (err)=>{
        if(err) {
            callback(err, null);
        }
    });

    let columns = '';
    let values = '';
    // Prepare columns and values
    for(let key in data) {
        if(columns!='') {
            columns += ',';
            values += ',';
        }
        columns += key;
        values += `'${data[key]}'`;
    }

    db.run(`INSERT INTO ${tableName} (${columns}) VALUES (${values})`, [], (err, result) => {

        if(err)
            callback(err, null);
        else
            callback('', 'success');
    });


    // close the DB
    db.close((err) => {
        if (err) {
            callback(err);
        }
    });
}



exports.delete = (tableName, whereCondition, callback) => {

    let db = new sqlite3.Database(dbName, sqlite3.OPEN_READWRITE, (err)=>{
        if(err) {
            callback(err, null);
        }
    });

    db.run(`DELETE FROM ${tableName} WHERE ${whereCondition}`, [], (err, result) => {

        if(err)
            callback(err, null);
        else
            callback('', 'success');
    });

    // close the DB
    db.close((err) => {
        if (err) {
            callback(err);
        }
    });

}