const app = require('../app.js')
const db = require('./db.js')
const themes = require('./themes.js')

var content,
author,
authorid,
args,
comm;

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

    if(users.indexOf(msg.author.id) == -1){
        db.run(`INSERT INTO users VALUES ("${msg.author.id}","${msg.author.username}","${app.themedefault}",${app.basecash},${Date.now()},${app.baseprod},${app.baseval},0,0,'first')`,callback)
    }

    function callback(){
        console.log('User registered')
        users.push(msg.author.id)
    }

    content = msg.content
    comm = content.split(' ')[0].replace(app.prefix,'')
    args = content.replace(app.prefix+comm+' ','').split(' ')
    for(let x=0;x<comm_list.length;x++){
        if(comm == comm_list[x]){
            this['cmd_'+comm](msg,args)
        }
    }
}

exports.cmd_help = function(msg,args){
    let msgtxt = '';

    console.log(this['cmd_start']['helptxt'])

    msgtxt += '```List of commands:\n'
    for(let x=0;x<comm_list.length;x++){
        msgtxt += app.prefix+comm_list[x]+'\n'
    }
    // msgtxt += '\nFor additional help on specific commands, type '+app.prefix+'help <command>```'
    msgtxt += '```'
    msg.reply(msgtxt)
}

exports.cmd_theme = function(msg,args){
    msgtxt = ''
    themes.getList(callback)
    function callback(list){
        if(args[0] != 'set'){
            msgtxt += 'Use '+app.prefix+'theme set <theme> to set your theme\n'
            msgtxt += '```Theme list:\n'
            for(var k in list){
                msgtxt += list[k]+'\n'
            }
            msgtxt += '```'
            msg.reply(msgtxt)
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

exports.cmd_start = function(msg){
    msg.reply(' this command is deprecated. You automatically start earning when you cash in, and when you first execute any command')
}

exports.cmd_stop = function(msg){
        let now = Date.now()

    db.get(`SELECT * FROM users WHERE disID = ${msg.author.id}`,callback)

    function callback(err,row){

        setVars(row,true,callback)
        function callback(minutes,seconds,pps,value,funds,timebonus,income){
            let tbinc;

            if(timebonus<1){
                timebonus = ((1-timebonus)*100).toFixed(2)
                tbinc = false
            }else{
                timebonus = ((timebonus-1)*100).toFixed(2)
                tbinc = true
            }

            themes.getMes(row.theme,['finishstatus','finishtimegood','finishtimebad','finishformula'],callback)

            function callback(things){
                let msgtxt = ''
                msgtxt += eval('`'+things[0]+'\n`')
                if(tbinc){
                    msgtxt += eval('`'+things[1]+'\n`')
                } else{
                    msgtxt += eval('`'+things[2]+'\n`')
                }
                msgtxt += eval('`'+things[3]+'`')

                msg.reply(msgtxt)

                gain = parseFloat(funds)+parseFloat(income)

                db.run(`UPDATE users SET currency='${gain}', starttime='${Date.now()}' WHERE disID=${msg.author.id}`)
            }
        }
    }
}

exports.cmd_status = function(msg){
    db.get(`SELECT * FROM users WHERE disID = ${msg.author.id}`,callback)
    let msgtxt = ''

    function callback(err,row){

        setVars(row,false,callback)

        function callback(minutes,seconds,pps,value,funds,timebonus,income){
            themes.getMes(row.theme,['checkstatus'],callback)

            function callback(things){
                msgtxt = eval('`'+things[0]+'`')
                msg.reply(msgtxt)
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


                    let price;
                    msgtxt += 'Type "!shop <item number>" to purchase.\n\n'
                    msgtxt += `__**${enh[0]}**__\n`
                    msgtxt += `Item   Increment   Cost\n\n`
                    for(var a=0;a<rows.length;a++){
                        price = null;

                        for(var w=0;w<items.length;w++){
                            item = items[w].split(':')[0]
                            if(parseInt(item) == parseInt(rows[a].id)){
                                price = items[w].split(':')[2]
                            }
                        }

                        if(price == null){
                            price = rows[a].price
                        }

                        upid = parseInt(rows[a].id)-themeItems['itemct']
                        if(upid == 1){
                            msgtxt += `__                                                __\n\n`
                            msgtxt += `__**${enh[1]}**__\n`
                            msgtxt += 'Item   Increment   Cost\n\n'
                        }

                        if(rows[a].type == 'quantity'){
                            themename = themeItems['item'+rows[a].id]
                            if(typeof themeItems['descit'+rows[a].id] != 'undefined'){
                                themedesc = themeItems['descit'+rows[a].id]
                                msgtxt += `${rows[a].id}. **${themename}**  +${rows[a].value}${themeItems['denomitem']}    $${parseFloat(price).toFixed(2)}\n*${themedesc}*\n\n`
                            }else{
                                msgtxt += `${rows[a].id}. **${themename}**  +${rows[a].value}${themeItems['denomitem']}    $${parseFloat(price).toFixed(2)}\n\n`
                            }

                        }
                        if(rows[a].type == 'upgrade'){
                            themename = themeUps['upgrade'+upid]
                            if(typeof themeItems['descit'+rows[a].id] != 'undefined'){
                                themedesc = themeUps['descup'+upid]
                                msgtxt += `${rows[a].id}. **${themename}**  +$${rows[a].value}${themeItems['denomupgrade']}    $${parseFloat(price).toFixed(2)}\n*${themedesc}*\n\n`
                            }else{
                                msgtxt += `${rows[a].id}. **${themename}**  +$${rows[a].value}${themeItems['denomupgrade']}    $${parseFloat(price).toFixed(2)}\n\n`
                            }


                        }
                    }
                    msg.reply(msgtxt)
                }
            }
        }
    } else {
        itemid = parseInt(content.split(' ')[1]);
        db.get(`SELECT * FROM users WHERE disID=${msg.author.id}`,callback)
        function callback(err,row){
            let itemstr = row.items.replace('first,','')
            let itemloc = null
            let items = []
            let theme = row.theme

            setVars(row,false,callback)
            function callback(minutes,seconds,pps,value,funds,timebonus,income){
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
                            itemloc = w;
                        }
                    }

                    if(itemloc == null){
                        price = row.price
                    }

                    themes.getMes(theme,['purchase','failpurchase'],callback)
                    function callback(things){
                        if(funds >= price){
                            let itemstr = 'first'
                            let currency = funds - price;

                            if(itemloc == null){
                                quantity = 1;
                                price = price*app.pricemult
                                itemstr += `,${itemid}:${quantity}:${price}`

                                for(var w=0;w<items.length;w++){
                                    itemstr += `,${items[w]}`
                                }

                            } else{
                                item = items[itemloc].split(':')
                                quantity = parseInt(item[1])+1
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
                            funds = parseFloat(currency)
                            funds = funds.toFixed(2)
                            msg.reply(eval('`'+things[0]+'\n`'))

                        } else {
                            msg.reply(eval('`'+things[1]+'\n`'))
                        }
                    }
                }
            }
        }

    }
}

function setVars(row,spec,callback){
    minutes = ((Date.now()-row.starttime)/1000/60).toFixed(2)
    seconds = ((Date.now()-row.starttime)/1000).toFixed(2)
    pps = row.quantity.toFixed(2)
    value = row.value.toFixed(2)
    funds = row.currency.toFixed(2)
    if(spec){
        timebonus = ((Date.now() - row.starttime)/1000/1200).toFixed(2)
        income = (pps*value*seconds*timebonus).toFixed(2)
    }else{
        timebonus = '```Tsk Tsk... Whoever made your theme tried to show you sensitive information!```'
        income = '```Tsk Tsk... Whoever made your theme tried to show you sensitive information!```'
    }
    callback(minutes,seconds,pps,value,funds,timebonus,income)
}

comms = Object.getOwnPropertyNames(this);
for(var w=0;w<comms.length;w++){
    if(comms[w].startsWith('cmd_')){
        comm_list.push(comms[w].replace('cmd_',''))
    }
}