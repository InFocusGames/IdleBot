const app = require('../app.js')
const db = require('./db.js')
const fs = require('fs')
const ini = require('ini')

var themes = {}

exports.getMes = function(theme,things,callback){
    retThings = []
    for(var obj in things){
        retThings.push(themes[theme]['messages'][things[obj]])
    }

    callback(retThings)
}

exports.getItems = function(theme,callback){
    enhance = [themes[theme]['items']['enhancementitem'],themes[theme]['items']['enhancementupgrade']]
    retItems = themes[theme]['items']
    retUps = themes[theme]['upgrades']
    callback(enhance,retItems,retUps)
}

exports.getList = function(callback){
    list = []
    for(var p in themes){
        list.push(p)
    }
    callback(list)
}

exports.parseThemes = function(dirname) {
    console.log('Parsing themes in folder '+dirname)
    let list = []
    db.all('SELECT * FROM items',callback)
    var curitems = []
    var curups = []
    function callback(err,rows){
        for(var w in rows){
            if(rows[w].type == 'quantity'){
                curitems.push(w)
            }else{
                curups.push(w)
            }
        }

        fs.readdir(dirname, function(err, filenames) {
            if (err) {
                console.log(err)
                return;
            }
            filenames.forEach(function(filename) {
                 theme = ini.parse(fs.readFileSync(dirname + filename, 'utf-8'))

                 title = theme.general.title
                 desc = theme.general.desc
                 author = theme.general.author

                 themes[title] = {}
                 themes[title]['items'] = {}
                 themes[title]['upgrades'] = {}
                 themes[title]['messages'] = {}

                 let tmpitems = [];
                 let tmpups = [];
                 for(var x in theme.item){
                     if(x.startsWith('item')){
                         if(theme['item'][x] != ''){
                             themes[title]['items'][x] = theme['item'][x]
                             tmpitems.push(x)
                         }
                     }
                     if(x.startsWith('upgrade')){
                         if(theme['item'][x] != ''){
                             themes[title]['upgrades'][x] = theme['item'][x]
                             tmpups.push(x)
                         }
                     }
                 }
                 themes[title]['items']['enhancementitem'] = theme.item.enhancementitem
                 themes[title]['items']['enhancementupgrade'] = theme.item.enhancementupgrade
                 themes[title]['items']['upct'] = curups.length
                 themes[title]['items']['itemct'] = curitems.length
                 themes[title]['items']['denomitem'] = theme.item.denomitem
                 themes[title]['items']['denomupgrade'] = theme.item.denomupgrade

                 finishstatus = theme.message.finishstatus
                 finishtimegood = theme.message.finishtimegood
                 finishtimebad = theme.message.finishtimebad
                 finishformula = theme.message.finishformula
                 checkstatus = theme.message.checkstatus
                 purchase = theme.message.purchase
                 failpurchase = theme.message.failpurchase

                 for(var u in theme.message){
                     themes[title]['messages'][u] = theme['message'][u]
                 }

                 error = false
                 if(purchase == '' | failpurchase == '' | finishformula == '' | finishtimebad == '' | finishtimegood == '' | finishstatus == '' | checkstatus == '' | title == '' | typeof purchase == 'undefined' | typeof failpurchase == 'undefined' |typeof finishformula == 'undefined' | typeof finishtimebad == 'undefined' | typeof finishtimegood == 'undefined' | typeof finishstatus == 'undefined' | typeof checkstatus == 'undefined' | typeof title == 'undefined'){
                     console.log('Some of the messages have not been configured in theme '+title+'. Will be unable to use.')
                     error = true
                 }
                 if(tmpups.length < curups.length){
                     console.log('There are not enough upgrade items defined in theme '+title+'. Will be unable to use.')
                     error = true
                 }
                 if(tmpitems.length < curitems.length){
                     console.log('There are not enough production items defined in theme '+title+'. Will be unable to use.')
                     error = true
                 }
                 if(error){
                     delete themes[title]
                 }else{
                     list.push(title)
                 }
            });
            console.log('Finished parsing themes: '+list)

        });
    }
}
