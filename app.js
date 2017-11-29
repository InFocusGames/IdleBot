'use strict';
//Packages
const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require('fs');
const ini = require('ini');


//Own Modules
const db = require('./includes/db.js')
const comm = require('./includes/commands.js');
const itemconfig = './config/items.json'
const themes = require('./includes/themes.js')



//Configuration
const config = ini.parse(fs.readFileSync('./config/config.ini', 'utf-8'))

const prefix = exports.prefix = config.general.commandprefix

const format = config.general.format
if(format == 'commas'){
    exports.format = '0,0,0,0.00'
}
if(format == 'letters'){
    exports.format = '0.00a'
}
if(format == 'scientific'){
    exports.format = '0.000e+0'
}

const pricemult = exports.pricemult = config.mechanics.pricemult
const basecash = exports.basecash = config.mechanics.basecash
const baseval = exports.baseval = config.mechanics.baseval
const baseprod = exports.baseprod = config.mechanics.baseprod

const themedefault = exports.themedefault = config.theme.default
const userspecific = exports.userspecific = config.theme.userspecific

const token = config.general.token;

const servid = config.general.serverid

var parsed;
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  // Will use this code to generate databases for each server, while in testing, only a single server
  // ${client.guilds.array()}
  var serverstr = `${client.guilds.keyArray()}`
  var servers = serverstr.split(',')

  for(var i=0;i<servers.length;i++){
      if(servers[i] === servid){
          var theserv=servers[i]
      }
  }

  fs.stat('./data/'+theserv+'.db', function(err, stat) {
        if(err == null) {
            db.init(theserv,callback)
        } else if(err.code == 'ENOENT') {
            // file does not exist
            db.createNew(theserv,itemconfig,callback)
        } else {
            console.log('Some other error: ', err.code);
        }
    });

  function callback(){
    comm.users()
    themes.parseThemes('./themes/')
  }


});



client.on('message', msg => {
    if(msg.content.startsWith(prefix)){
        comm.parse(msg)
    }
});

client.login(token);
