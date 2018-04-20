const Discord = require("discord.js");
const help_embed = new Discord.RichEmbed()
const client = new Discord.Client();
const EventEmitter = require('events').EventEmitter;
const weather = require("weather-js");
client.login("NDM2ODczMjM3MzI3MTE4MzQ2.Dbt1cA.diaKrQuFq3dZ6D3Ah6PeGQUqBJk");
const Wiki = require("wikijs");
const express = require("express");
const os = require('os')
var app = express();
var AuthDetails = require("./auth.json");
var RedisSessions = require("redis-sessions");
var rs = new RedisSessions();
var Music = require("./Music.js");
var ffmpeg = require("ffmpeg");
var search = require('youtube-search'),
yt = require("./youtube_plugin"),
youtube_plugin = new yt(),
music = new Music();
var prefix = ".";
var moment = require("moment");
var mention = "<@1930903359700619264>";
const opts = {
  maxResults: 3,
  key: AuthDetails.youtube_api_key
};

client.on("ready", () => {
var memberCount = client.users.size;
var servercount = client.guilds.size;
		client.user.setPresence({ game: { name: `Salut tout le monde`, type: 0} });
	var servers = client.guilds.array().map(g => g.name).join(',');
})

client.on("ready", () => {
    console.log("BOT actif");
})

var messages = [];
client.on('message', message => {
   music.setVoiceChannel(message.member.voiceChannel);
    var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
        case ("!play") :
            console.log("Play");
            message.delete(message.author);
            if (!message.member.roles.find('name', 'DJ')) {
            if (!music.getVoiceChannel()) return message.reply("Veuillez vous connectez en vocal !");
            if (music.getTab(0) == null) return message.reply('Aucune musique, merci d\' en ajouté.');
            else music.voice();
            }
            break;
        case ("!pause") :
            console.log("Pause");
            message.delete(message.author);
            if (!message.member.roles.find('name', 'DJ')) {
            if (!music.getVoiceChannel()) return message.reply("Veuillez vous connectez en vocal !");
            if (music.getTab(0) == null) return message.reply('Aucune musique, merci d\' en ajouté.');
            music.pause();
            }
            break;
        case ("!resume") :
            console.log("Resume");
            message.delete(message.author);
            if (!music.getVoiceChannel()) return message.reply("Veuillez vous connectez en vocal !");
            if (music.getTab(0) == null) return message.reply('Aucune musique, merci d\' en ajouté.');
            music.resume();
            break;
        case ("!stop") :
            console.log("Stop");
            message.delete(message.author);
            if (!music.getVoiceChannel()) return message.reply("Veuillez vous connectez en vocal !");
            if (music.getTab(0) == null) return message.reply('Aucune musique');
            else music.stop();
            message.reply("La queue à été vidé !");
            break;
        case ("!add") :
            console.log("Add");
			message.delete(message.author);
            var link = message.content.split(' ');
            link.shift();
            link = link.join(' ');
            search(link, opts, function(err, results) {
                if(err) return console.log(err);
                for (var y = 0; results[y].kind == 'youtube#channel'; y++);
                message.channel.sendMessage(results[y].link);
                music.setTabEnd(results[y].link);
            })
            break;
        case ("!link") :
            console.log("Link");
            message.delete(message.author);
            var link = message.content.split(' ');
            link.shift();
            link = link.join(' ');
            console.log(link);
            music.setTabEnd(link);
            break;
        case ("!volume") :
            console.log("Volume");
            message.delete(message.author);
            var link = message.content.split(' ');
            link.shift();
            link = link.join(' ');
            music.volume(link/100);
            message.reply("le volume et maintenant à :" + link);
            break;
        case ("!next") :
        console.log("Next");
        message.delete(message.author);
        if (music.getI() < music.getLengthTab()) music.setI(this.i + 1);
        if (music.getI() >= music.getLengthTab()) music.setI(0);
        music.next();
    break;
}
    
    if (message.content === ("!channel")){
    const data = client.channels.get(message.channel.id);
    moment.locale("fr");
    var temps = moment(data.createdTimestamp).format("LLLL");
    console.log(temps)
    message.reply("\n" + "```javascript"+ "\n" + "Nom du channel: " + data.name + "\n" + "Type de channel: " + data.type + "\n" +
    "Channel id: " + data.id + "\n" + "Topic: " + data.topic + "\n" + "Créer le: " + temps + "```" );
    console.log("\n" + "**" + "Channel id: " + data.id + "**" );
    console.log(data);
    }
else if (message.content.startsWith("!météo")){
    var location = message.content.substr(6);
    var unit = "C";
    
    try {
        weather.find({search: location, degreeType: unit}, function(err, data) {
            if(err) {
                console.log(Date.now(), "DANGER", "Je ne peut pas trouvé d'information pour la méteo de " + location);
                message.reply("\n" + "Je ne peut pas trouvé d'information pour la méteo de " + location);
            } else {
                data = data[0];
               console.log("**" + data.location.name + " Maintenant : **\n" + data.current.temperature + "°" + unit + " " + data.current.skytext + ", ressentie " + data.current.feelslike + "°, " + data.current.winddisplay + " Vent\n\n**Prévisions pour demain :**\nHaut: " + data.forecast[1].high + "°, Bas: " + data.forecast[1].low + "° " + data.forecast[1].skytextday + " avec " + data.forecast[1].precip + "% de chance de precipitation.");
               message.reply("\n" + "**" + data.location.name + " Maintenant : **\n" + data.current.temperature + "°" + unit + " " + data.current.skytext + ", ressentie " + data.current.feelslike + "°, " + data.current.winddisplay + " Vent\n\n**Prévisions pour demain :**\nHaut: " + data.forecast[1].high + "°, Bas: " + data.forecast[1].low + "° " + data.forecast[1].skytextday + " avec " + data.forecast[1].precip + "% de chance de precipitation.");
            }
        });
    } catch(err) {
        console.log(Date.now(), "ERREUR", "Weather.JS a rencontré une erreur");
        message.reply("Idk pourquoi c'est cassé tbh :(");
        }
}
});

app.get('/playlist', function (req, res) {
    var json = JSON.stringify(music.tab);
    res.send(json);
});

client.on('ready', function () {
    client.user.setActivity('EltixeRoleplay et OliakeCraft').catch(console.error)
})

client.on('message', message => {
     var array_msg = message.content.split(' ');
             messages.push(message);
             switch (array_msg[0]) {
         case ("merde") :
             message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
             message.delete(message.author);
    }
})

client.on('message', message => {
    var array_msg = message.content.split(' ');
        messages.push(message);
        switch (array_msg[0]) {
        case ("Merde") :
        message.channel.send(` :loudspeaker: :triumph: TON LAGAGE ${message.author} :triumph: :loudspeaker:  `);
         message.delete(message.author);
    }
})

client.on('message', function (message) {
    if (message.content === "!avastliscense") {
        message.reply('https://cdn.discordapp.com/attachments/428599482758856715/428614440674656270/Avast_Internet_Security_Till_28.10.2018.avastlic')
    }
})

        client.on('message', message => {
        var array_msg = message.content.split(' ');
        messages.push(message);
        switch (array_msg[0]) {
        case ("fdp") :
        message.channel.send(` :loudspeaker: :triumph: TON LAGAGE ${message.author} :triumph: :loudspeaker:  `);
        message.delete(message.author);
    }
})

client.on('message', message => {
        var array_msg = message.content.split(' ');
        messages.push(message);
        switch (array_msg[0]) {
    case ("Merde") :
        message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
        message.delete(message.author);
    }
})

client.on('message', message => {
        var array_msg = message.content.split(' ');
        messages.push(message);
        switch (array_msg[0]) {
    case ("fils de pute") :
        message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
        message.delete(message.author);
    }
})

client.on('message', message => {
        var array_msg = message.content.split(' ');
        messages.push(message);
        switch (array_msg[0]) {
    case ("Fils de pute") :
        message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
        message.delete(message.author);
    }
})

client.on('message', message => {
        var array_msg = message.content.split(' ');
        messages.push(message);
        switch (array_msg[0]) {
    case ("FILS DE PUTE") :
        message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
        message.delete(message.author);
    }
})

client.on('message', message => {
    var array_msg = message.content.split(' ');
    messages.push(message);
    switch (array_msg[0]) {
case ("Enculler") :
    message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
    message.delete(message.author);
    }
})

client.on('message', message => {
    var array_msg = message.content.split(' ');
    messages.push(message);
    switch (array_msg[0]) {
case ("enculler") :
    message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
    message.delete(message.author);
    }
})

client.on('message', message => {
    var array_msg = message.content.split(' ');
    messages.push(message);
    switch (array_msg[0]) {
case ("Nique ta mère") :
    message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
    message.delete(message.author);
    }
})

client.on('message', message => {
    var array_msg = message.content.split(' ');
    messages.push(message);
    switch (array_msg[0]) {
case ("nique ta mère") :
    message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
    message.delete(message.author);
    }
})

client.on('message', message => {
    var array_msg = message.content.split(' ');
    messages.push(message);
    switch (array_msg[0]) {
case ("nike ta mère") :
    message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
    message.delete(message.author);
    }
})

client.on('message', function (message) {
    if (message.content === 'Chocolatine') {
        message.channel.send(`Pain au chocolat`) 
        }
})

client.on('message', message => {
    var array_msg = message.content.split(' ');
    messages.push(message);
    switch (array_msg[0]) {
case ("Nike ta mère") :
    message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
    message.delete(message.author);
    }
})

client.on('message', message => {
    var array_msg = message.content.split(' ');
    messages.push(message);
    switch (array_msg[0]) {
case ("Grosse pute") :
    message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
    message.delete(message.author);
    }
})

client.on('message', message => {
    var array_msg = message.content.split(' ');
    messages.push(message);
    switch (array_msg[0]) {
case ("vntm") :
    message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
    message.delete(message.author);
    }
})

client.on('message', message => {
    var array_msg = message.content.split(' ');
    messages.push(message);
    switch (array_msg[0]) {
case ("VNTM") :
    message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
    message.delete(message.author);
    }
})

client.on('message', message => {
    var array_msg = message.content.split(' ');
    messages.push(message);
    switch (array_msg[0]) {
case ("pd") :
    message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
    message.delete(message.author);
    }
})

client.on('message', message => {
    var array_msg = message.content.split(' ');
    messages.push(message);
    switch (array_msg[0]) {
case ("PD") :
    message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
    message.delete(message.author);
    }
})

client.on('message', message => {
    var array_msg = message.content.split(' ');
    messages.push(message);
    switch (array_msg[0]) {
case ("con") :
    message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
    message.delete(message.author);
    }
})

client.on('message', message => {
    var array_msg = message.content.split(' ');
    messages.push(message);
    switch (array_msg[0]) {
case ("CON") :
    message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
    message.delete(message.author);
    }
})

client.on('message', message => {
    var array_msg = message.content.split(' ');
    messages.push(message);
    switch (array_msg[0]) {
case ("connard") :
    message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
    message.delete(message.author);
    }
})

client.on('message', message => {
    var array_msg = message.content.split(' ');
    messages.push(message);
    switch (array_msg[0]) {
case ("tg") :
    message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
    message.delete(message.author);
    }
})

client.on('message', message => {
    var array_msg = message.content.split(' ');
    messages.push(message);
    switch (array_msg[0]) {
case ("ftg") :
    message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
    message.delete(message.author);
    }
})

client.on('message', message => {
    var array_msg = message.content.split(' ');
    messages.push(message);
    switch (array_msg[0]) {
case ("chatte") :
    message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author} :triumph: :loudspeaker:  `);
    message.delete(message.author);
    }
})

client.on('message', message => {
    if (message.content === 'Avatar') {
      message.channel.send(message.author.avatarURL);
    }
})

client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.find('name', 'welcome');
    if (!channel) return;
    channel.send(`Bienvenue sur notre serveur discord, ${member}`);
})

client.on('message', message => {
    if (message.content == 'e!clear') {
    if (!message.channel.permissionsFor(message.author).hasPermission("MANAGE_MESSAGES")) {
    message.channel.sendMessage("Désoler mais vous n' avez pas la permission de faire ceci");
    return;
    } else if (!message.channel.permissionsFor(client.user).hasPermission("MANAGE_MESSAGES")) {
    message.channel.sendMessage("Désoler mais vous n' avez pas la permission de faire ceci");
    return;
    }
    if (message.channel.type == 'text') {
        message.channel.fetchMessages()
        .then(messages => {
            message.channel.bulkDelete(messages);
            messagesDeleted = messages.array().length; 
        })
        .catch(err => {
            console.log('Error while doing Bulk Delete');
            console.log(err);
         });
        }
    }
});

app.listen(AuthDetails.port);
