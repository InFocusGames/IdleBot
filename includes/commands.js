'use strict';
const app = require('../app.js');
const db = require('./db.js');
const themes = require('./themes.js');
const numeral = require('numeral');
const Discord = require('discord.js');

var content,
author,
authorid,
args,
comm,
msgtxt,
msgtxt2;

var comm_list = [];
var users = [];

exports.users = function(){
    users = []
    db.all(`SELECT disID FROM users`,callback)

    function callback(err,rows){
        for(var x in rows){
            users.push(rows[x].disID)
        }
    }
}

exports.parse = function(msg){
    var cmds = this
    if(users.indexOf(msg.author.id) == -1){
        db.run(`INSERT INTO users VALUES ("${msg.author.id}","${msg.author.username}","${app.themedefault}",${app.basecash},${Date.now()},${app.baseprod},${app.baseval},0,0,'first')`,callback)
    }else{
        launch()
    }

    function callback(){
        console.log('User registered')
        users.push(msg.author.id)
        launch()
    }

    function launch(){
        content = msg.content
        comm = content.split(' ')[0].replace(app.prefix,'')
        args = content.replace(app.prefix+comm+' ','').split(' ')
        for(let x=0;x<comm_list.length;x++){
            if(comm == comm_list[x]){
                cmds['cmd_'+comm](msg,args)
            }
        }
    }
}

exports.cmd_help = function(msg,args){
    let mess = new Discord.RichEmbed();
    let msgtxt = '';

    mess.setTitle('List of commands');
    // msgtxt += '```List of commands:\n'
    for(let x=0;x<comm_list.length;x++){
        // msgtxt += app.prefix+comm_list[x]+'\n'
        mess.addField(app.prefix+comm_list[x],'*No help text provided*',true)
    }
    // msgtxt += '\nFor additional help on specific commands, type '+app.prefix+'help <command>```'
    // msgtxt += '```'
    // sendMsg(msg,msgtxt,false,3)
    sendMsg(msg,mess)
    //    msg.reply(msgtxt)
}

exports.cmd_theme = function(msg,args){
    if(app.userspecific){
        let mess = new Discord.RichEmbed();
        db.get(`SELECT theme FROM users WHERE disID=${msg.author.id}`,callback)
        function callback(err,row){
            msgtxt = ''
            themes.getList(callback)
            function callback(list,dlist){
                if(args[0] != 'set'){
                    mess.setTitle(`Use '${app.prefix}theme set <theme>' to set your theme`).setDescription(`Your current theme is **${row.theme}**`);//.addField('**Theme list**','');
                    // msgtxt += `Use '${app.prefix}theme set <theme>' to set your theme\nYour current theme is **${row.theme}**\n`
                    // msgtxt += '\n__**Theme list**__\n\n'
                    for(var k in list){
                        if(dlist[k] != ''){
                            // msgtxt += `**${list[k]}**\n*${dlist[k]}*\n\n`
                            mess.addField(`**${list[k]}**`,`*${dlist[k]}*`,true)
                        }else{
                            // msgtxt += `**${list[k]}**\n\n`
                            mess.addField(`**${list[k]}**`,`*No description*`,true)
                        }
                    }

                    // msg.reply(msgtxt)
                    sendMsg(msg,mess)
                }else{
                    if(list.indexOf(args[1]) != -1){
                        db.run(`UPDATE users SET theme='${args[1]}' WHERE disID=${msg.author.id}`)
                        msg.reply(`Your theme has been set to ***${args[1]}***`)
                    }else{
                        msg.reply(`Hm, I cant find that theme. Recheck your command.`)
                    }
                }
            }
        }
    }else{
        msg.reply('Sorry! Whoever set me up disabled theme customization!')
    }
}

// exports.cmd_start = function(msg){
//     msg.reply(' this command is deprecated. You automatically start earning when you cash in, and when you first execute any command')
// }

exports.cmd_stop = function(msg){
        let now = Date.now()

    db.get(`SELECT * FROM users WHERE disID = ${msg.author.id}`,callback)

    function callback(err,row){

        setVars(row,true,callback)
        function callback(minutes,seconds,pps,ppsform,value,valueform,funds,fundsform,timebonus,income,incomeform){
            let fundso = funds
            let incomeo = income
            funds = fundsform
            pps = ppsform
            value = valueform
            income = incomeform

            let tbinc;

            if(timebonus<1){
                timebonus = ((1-timebonus)*100).toFixed(2)
                tbinc = false
            }else{
                timebonus = ((timebonus-1)*100).toFixed(2)
                tbinc = true
            }

            themes.getMes(row.theme,['finishstatus','finishtimegood','finishtimebad','finishformula','commentbad','commentgood','commentformula','commentstatus'],callback)

            function callback(things){
                let msgtxt = ''
                let mess = new Discord.RichEmbed();
                // msgtxt += eval('`'+things[0]+'\n`')
                mess.addField(eval('`'+things['finishstatus']+'`'),eval('`'+things['commentstatus']+'`'));
                if(tbinc){
                    // msgtxt += eval('`'+things[1]+'\n`')
                    mess.addField(eval('`'+things['finishtimegood']+'`'),eval('`'+things['commentgood']+'`'))
                } else{
                    // msgtxt += eval('`'+things[2]+'\n`')
                    mess.addField(eval('`'+things['finishtimebad']+'`'),eval('`'+things['commentbad']+'`'))
                }
                // msgtxt += eval('`'+things[3]+'`')
                mess.addField(eval('`'+things['finishformula']+'`'),eval('`'+things['commentformula']+'`'))

                // msg.reply(msgtxt)
                sendMsg(msg,mess)

                let gain = parseFloat(fundso)+parseFloat(incomeo)

                db.run(`UPDATE users SET currency='${gain}', starttime='${Date.now()}' WHERE disID=${msg.author.id}`)
            }
        }
    }
}

exports.cmd_status = function(msg){
    db.get(`SELECT * FROM users WHERE disID = ${msg.author.id}`,callback)
    let msgtxt = ''
    let mess = new Discord.RichEmbed();

    function callback(err,row){

        setVars(row,false,callback)

        function callback(minutes,seconds,pps,ppsform,value,valueform,funds,fundsform,timebonus,income,incomeform){
            pps = ppsform
            value = valueform
            funds = fundsform
            themes.getMes(row.theme,['checkstatus','statustitle'],callback)

            function callback(things){
                mess.addField(eval('`'+things['statustitle']+'`'),eval('`'+things['checkstatus']+'`'));
                // msgtxt = eval('`'+things['checkstatus']+'`')
                sendMsg(msg,mess)
            }
        }
    }
}

exports.cmd_shop = function(msg,args){
    if(isNaN(args[0])){
        db.get(`SELECT theme,items FROM users WHERE disID = ${msg.author.id}`,callback)

        function callback(err,row){
            let items = row.items.replace('first,','')
            if(items != 'first'){
                items = items.split(',')
            }

            themes.getItems(row.theme,callback)
            function callback(enh,themeItems,themeUps){
                db.all('SELECT * FROM items',callback2)
                function callback2(err,rows){
                    let type = '.\n';
                    let msgtxt = '';
                    let msgtxt2 = '';

                    let price;

                    // let mess = new Discord.RichEmbed();


                    // mess.setTitle('Type "!shop <item number> <quantity>" to purchase.');
                    // mess.setColor(3756054);

                    // mess.addField("Item", "Blank", true).addField("Increment", "Blank", true).addField("Cost", "Blank", true).addBlankField();
                    // msgtxt += 'Type "!shop <item number> <quantity>" to purchase.\n\n'
                    msgtxt += `__**${enh[0]}**__\n`
                    msgtxt += `Item   Increment   Cost\n\n`
                    for(var a=0;a<rows.length;a++){
                        price = null;

                        for(var w=0;w<items.length;w++){
                            let item = items[w].split(':')[0]
                            if(parseInt(item) == parseInt(rows[a].id)){
                                price = rows[a].price*Math.pow(app.pricemult,parseInt(items[w].split(':')[1])+1)
                            }
                        }

                        if(price == null){
                            price = rows[a].price
                        }

                        price = numFormating(price)

                        let upid = parseInt(rows[a].id)-themeItems['itemct']
                        if(upid == 1){
                            // // msgtxt2 += `__                                                __\n\n`
                            msgtxt2 += `__**${enh[1]}**__\n`
                            msgtxt2 += 'Item   Increment   Cost\n\n'
                        }

                        let symbol = themeItems['symbol']
                        let watfix = themeItems['prefix']
                        let prefix,
                        suffix;

                        if(watfix){
                            prefix = themeItems['symbol']
                            suffix = ''
                        }else{
                            suffix = themeItems['symbol']
                            prefix = ''
                        }


                        let themename,
                        themedesc;
                        if(rows[a].type == 'quantity'){
                            themename = themeItems['item'+rows[a].id]
                            if(typeof themeItems['descit'+rows[a].id] != 'undefined'){
                                themedesc = themeItems['descit'+rows[a].id]
                                msgtxt += `${rows[a].id}. **${themename}**  +${rows[a].value}${themeItems['denomitem']}    ${prefix}${price}${suffix}\n*${themedesc}*\n\n`
                                // mess.addField(`${rows[a].id}. **${themename}**`,`*${themedesc}*`,true).addField(`+${rows[a].value}${themeItems['denomitem']}`,`**${themename}**`,true).addField(`${prefix}${price}${suffix}`,true)
                            }else{
                                msgtxt += `${rows[a].id}. **${themename}**  +${rows[a].value}${themeItems['denomitem']}    ${prefix}${price}${suffix}\n\n`
                            }

                        }
                        if(rows[a].type == 'upgrade'){
                            themename = themeUps['upgrade'+upid]
                            if(typeof themeUps['descup'+upid] != 'undefined'){
                                themedesc = themeUps['descup'+upid]
                                msgtxt2 += `${rows[a].id}. **${themename}**  +${prefix}${rows[a].value}${suffix}${themeItems['denomupgrade']}    ${prefix}${price}${suffix}\n*${themedesc}*\n\n`
                            }else{
                                msgtxt2 += `${rows[a].id}. **${themename}**  +${prefix}${rows[a].value}${suffix}${themeItems['denomupgrade']}    ${prefix}${price}${suffix}\n\n`
                            }


                        }
                    }
                    // msg.reply(msgtxt)
                    // msg.reply(msgtxt2)
                    sendMsg(msg,msgtxt,true)
                    sendMsg(msg,msgtxt2,true)
                    // sendMsg(msg,mess)
                }
            }
        }
    } else {
        itemid = parseInt(content.split(' ')[1]);
        itemcnt = parseInt(content.split(' ')[2])
        if(isNaN(itemcnt)){
            itemcnt = 1
        }

        db.get(`SELECT * FROM users WHERE disID=${msg.author.id}`,callback)
        function callback(err,row){
            let itemstr = row.items.replace('first,','')
            let itemloc = null
            let items = []
            let theme = row.theme

            setVars(row,false,callback)
            function callback(minutes,seconds,pps,ppsform,value,valueform,funds,fundsform,timebonus,income,incomeform){

                let itemval = parseFloat(value)
                let itemquan = parseFloat(pps)

                if(itemstr != 'first'){
                    items = itemstr.split(',')
                }

                db.get(`SELECT * FROM items WHERE id=${itemid}`,callback2)

                function callback2(err,row){
                    let itemid = row.id
                    for(var w=0;w<items.length;w++){
                        item = items[w].split(':')[0]

                        if(parseInt(item) == parseInt(row.id)){
                            price = parseFloat(items[w].split(':')[2])
                            itemq = parseInt(items[w].split(':')[1])
                            itemloc = w;
                        }
                    }

                    if(itemloc == null){
                        price = row.price
                        itemq = 0
                    }

                    price = row.price*Math.pow(app.pricemult,itemq+itemcnt)

                    themes.getMes(theme,['purchase','failpurchase'],callback)
                    function callback(things){
                        if(funds >= price){
                            let itemstr = 'first'
                            let currency = funds - price;
                            funds = numFormating(currency)

                            if(itemloc == null){
                                quantity = itemcnt;
                                price = price*app.pricemult
                                itemstr += `,${itemid}:${quantity}:${price}`

                                for(var w=0;w<items.length;w++){
                                    itemstr += `,${items[w]}`
                                }

                            } else{
                                item = items[itemloc].split(':')
                                quantity = parseInt(item[1])+itemcnt
                                price = parseFloat(item[2])*Math.pow(app.pricemult,quantity)
                                itemstr += `,${itemid}:${quantity}:${price}`
                                itemss = items.splice(itemloc, 1)
                                for(var w=0;w<items.length;w++){
                                    itemstr += `,${items[w]}`
                                }
                            }

                            if(row.type == "upgrade"){
                                itemval += parseFloat(row.value)
                                db.run(`UPDATE users SET currency=${currency}, value=${itemval}, items='${itemstr}' WHERE disID=${msg.author.id}`)
                            }else{
                                itemquan += parseFloat(row.value)
                                db.run(`UPDATE users SET currency=${currency}, quantity='${itemquan}', items='${itemstr}' WHERE disID=${msg.author.id}`)
                            }

                            msg.reply(eval('`'+things[0]+'\n`'))

                        } else {
                            funds = fundsform
                            msg.reply(eval('`'+things[1]+'\n`'))
                        }
                    }
                }
            }
        }

    }
}

function numFormating(num){
    num = parseFloat(num)
    let retNum = numeral(num).format(app.format);
    return retNum
}

function setVars(row,spec,callback){
    let minutes = ((Date.now()-row.starttime)/1000/60).toFixed(2)
    let seconds = ((Date.now()-row.starttime)/1000).toFixed(2)
    let pps = row.quantity.toFixed(2)
    let ppsform = numFormating(row.quantity)
    let value = row.value.toFixed(2)
    let valueform = numFormating(row.value)
    let funds = row.currency.toFixed(2)
    let fundsform = numFormating(row.currency)
    if(spec){
        var timebonus = (Math.log(((Date.now() - row.starttime)/1000/60)) / Math.log(50));
        var income = (pps*value*seconds*timebonus).toFixed(2);
        var incomeform = numFormating(income);
    }else{
        var timebonus = '```Tsk Tsk... Whoever made your theme tried to show you sensitive information!```';
        var income = '```Tsk Tsk... Whoever made your theme tried to show you sensitive information!```';
        var incomeform = 'dude plz';
    }
    
    callback(minutes,seconds,pps,ppsform,value,valueform,funds,fundsform,timebonus,income,incomeform)
}

function sendMsg(msg,content,reply,timeout){
    if(reply){
	msg.reply(content)
    }else{
	msg.channel.send(content)
    }
    console.log(msg.content)
    if(!isNaN(timeout)){
	
    }
}

let comms = Object.getOwnPropertyNames(this);
for(var w=0;w<comms.length;w++){
    if(comms[w].startsWith('cmd_')){
        comm_list.push(comms[w].replace('cmd_',''))
    }
}
