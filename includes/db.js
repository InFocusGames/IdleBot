const sqlite3 = require('sqlite3').verbose();

exports.createNew = function(name,itemconfig,callback){
    let itemfile = require('../'+itemconfig)
    name += '.db'

    db = new sqlite3.Database('./data/'+name);
    db.serialize(function() {
        db.run("CREATE TABLE users (disID TEXT PRIMARY KEY, disNAM TEXT, theme TEXT, currency NUMERIC, starttime NUMERIC, quantity NUMERIC, value NUMERIC, multiplier NUMERIC, bonuses NUMERIC,items TEXT)");
        db.run("CREATE TABLE items (id NUMERIC PRIMARY KEY, name TEXT, value NUMERIC, price NUMERIC, type TEXT)");

        let i=1;
        for (item in itemfile) {
            db.run("INSERT INTO items VALUES (?,?,?,?,?)",{
                1: i,
                2: item,
                3: itemfile[item].value,
                4: itemfile[item].price,
                5: itemfile[item].type
            });
            i++;
        }
    })

    console.log('Database created!')
    callback()
}

exports.init = function(name,callback){
    name += '.db'
    db = new sqlite3.Database('./data/'+name);
    console.log('Database initialized!')
    callback()
}

exports.run = function(query,callback){
    db.run(query,callback2)
    function callback2(err,row){
        console.log(err)
        if(typeof callback != 'undefined'){
            callback(err,row)
        }
    }
}

exports.get = function(query,callback){
    db.get(query,callback)
}

exports.all = function(query,callback){
    db.all(query,callback)
}
