const Discord = require("discord.js");
const help_embed = new Discord.RichEmbed()
const client = new Discord.Client();
const weather = require("weather-js");
client.login("NDE4MTUzOTY3OTE1MzY4NDQ4.DXdbwQ.irnHoN4v1H-wJtKGFXM54q_eSHU");
const Wiki = require("wikijs");
const express = require("express");
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
	var servers = client.guilds.array().map(g => g.name).join(',');
})

client.on("ready", () => {
    console.log("BOT_ELTIXE actif");
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
            if (!message.member.roles.find('name', 'DJ')) {
            if (!music.getVoiceChannel()) return message.reply("Veuillez vous connectez en vocal !");
            if (music.getTab(0) == null) return message.reply('Aucune musique, merci d\' en ajouté.');
            music.resume();
            }
            break;
        case ("!stop") :
            console.log("Stop");
            message.delete(message.author);
            if (!message.member.roles.find('name', 'DJ')) {
            if (!music.getVoiceChannel()) return message.reply("Veuillez vous connectez en vocal !");
            if (music.getTab(0) == null) return message.reply('Aucune musique');
            else music.stop();
            message.reply("La queue à été vidé !");
            }
            break;
        case ("!add") :
            console.log("Add");
			message.delete(message.author);
            var link = message.content.split(' ');
            link.shift();
            link = link.join(' ');
            search(link, opts, function(err, results) {
                if (!message.member.roles.find('name', 'DJ')) {
                if(err) return console.log(err);
                for (var y = 0; results[y].kind == 'youtube#channel'; y++);
                message.channel.sendMessage(results[y].link);
                music.setTabEnd(results[y].link);
                }
            })
            break;
        case ("e!link") :
            console.log("Link");
            message.delete(message.author);
            var link = message.content.split(' ');
            link.shift();
            link = link.join(' ');
            console.log(link);
            music.setTabEnd(link);
            break;
        case ("e!volume") :
            console.log("Volume");
            message.delete(message.author);
            var link = message.content.split(' ');
            link.shift();
            link = link.join(' ');
            music.volume(link/100);
            message.reply("le volume et maintenant à :" + link);
            break;
        case ("e!next") :
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
});

app.get('/playlist', function (req, res) {
    var json = JSON.stringify(music.tab);
    res.send(json);
});

client.on('ready', function () {
    client.user.setActivity('EltixeRoleplay').catch(console.error)
})

client.on('message', function (message) {
    if (message.content === 'Bonjour') {
        message.channel.send(`Bonjour à toi ${message.author.username}`) 
    }
})

client.on('message', function (message) {
    if (message.content === 'bonjour') {
        message.channel.send(`Bonjour à toi ${message.author.username}`) 
        }
})

client.on('message', function (message) {
    if (message.content === 'bj') {
        message.channel.send(`Bonjour à toi ${message.author.username}`) 
        }
})

client.on('message', function (message) {
    if (message.content === 'BJ') {
        message.channel.send(`Bonjour à toi ${message.author.username}`) 
        }
})


client.on('message', function (message) {
    if (message.content === 'cc') {
        message.channel.send(`Bonjour à toi ${message.author.username}`) 
        }
})

client.on('message', function (message) {
    if (message.content === 'CC') {
        message.channel.send(`Bonjour à toi ${message.author.username}`) 
        }
})

client.on('message', function (message) {
    if (message.content === 'Salut') {
        message.channel.send(`Bonjour à toi ${message.author.username}`) 
        }
})

client.on('message', function (message) {
    if (message.content === 'salut') {
        message.channel.send(`Bonjour à toi ${message.author.username}`) 
        }
})

client.on('message', function (message) {
    if (message.content === 'merde') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(` :loudspeaker: :triumph: PAS DE GROS MOTS ${message.author.username} :triumph: :loudspeaker: `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'Merde') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(` :loudspeaker: :triumph: PAS DE GROS MOTS ${message.author.username} :triumph: :loudspeaker: `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'fdp') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author.username} :triumph: :loudspeaker:  `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'FDP') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author.username} :triumph: :loudspeaker:  `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'fils de pute') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author.username} :triumph: :loudspeaker:  `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'Fils de pute') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author.username} :triumph: :loudspeaker:  `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'Enculler') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author.username} :triumph: :loudspeaker:  `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'enculler') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author.username} :triumph: :loudspeaker:  `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'Nique ta mère') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author.username} :triumph: :loudspeaker:  `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'nique ta mère') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author.username} :triumph: :loudspeaker:  `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'nike ta mère') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author.username} :triumph: :loudspeaker:  `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'Chocolatine') {
        message.channel.send(`Pain au chocolat`) 
        }
})

client.on('message', function (message) {
    if (message.content === 'Nike ta mère') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author.username} :triumph: :loudspeaker:  `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'Grosse pute') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(` :loudspeaker: :triumph: TON LAGUAGE ${message.author.username} :triumph: :loudspeaker:  `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'vntm') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(` :red_circle:  :triumph: PAS DE CES MOTS ${message.author.username} :triumph: :red_circle: `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'VNTM') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(` :red_circle:  :triumph: PAS DE CES MOTS ${message.author.username} :triumph: :red_circle: `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'pd') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(`:red_circle:  :triumph: PAS DE CES MOTS ${message.author.username} :triumph: :red_circle: `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'PD') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(`:red_circle:  :triumph: PAS DE CES MOTS ${message.author.username} :triumph: :red_circle: `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'con') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(` :loudspeaker: :triumph: PAS DE GROS MOTS ${message.author.username} :triumph: :loudspeaker:`) 
        }
})

client.on('message', function (message) {
    if (message.content === 'connard') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(` :loudspeaker: :triumph: PAS DE GROS MOTS ${message.author.username} :triumph: :loudspeaker: `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'tg')
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(` :loudspeaker: :triumph: PAS DE GROS MOTS ${message.author.username} :triumph: :loudspeaker: `)
        }
)

client.on('message', function (message) {
    if (message.content === 'ftg') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(` :loudspeaker: :triumph: PAS DE GROS MOTS ${message.author.username} :triumph: :loudspeaker: `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'con') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(` :loudspeaker: :triumph: PAS DE GROS MOTS ${message.author.username} :triumph: :loudspeaker: `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'caca') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
        message.channel.send(`Tu aime vraiment sa ${message.author.username}  https://www.youtube.com/watch?v=zm0xLiy6aqs ?`) 
        }
})

client.on('message', function (message) {
    if (message.content === 'bite') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(`:triumph: PAS DE SES MOTS ${message.author.username} :triumph:`) 
        }
})

client.on('message', function (message) {
    if (message.content === 'chatte') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
	message.delete(message.author);
        message.channel.send(`:triumph: PAS DE SES MOTS ${message.author.username} :triumph:`) 
        }
})

client.on('message', function (message) {
    if (message.content === 'Bonne nuit') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
        message.channel.send(`Bonne nuit à toi ${message.author.username} `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'Bn') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
        message.channel.send(`Bonne nuit à toi ${message.author.username} `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'bn') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
        message.channel.send(`Bonne nuit à toi ${message.author.username} `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'BN') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
        message.channel.send(`Bonne nuit à toi ${message.author.username} `) 
        }
})

client.on('message', function (message) {
    if (message.content === 'bN') {
	        var array_msg = message.content.split(' ');
            messages.push(message);
            switch (array_msg[0]) {
        message.channel.send(`Bonne nuit à toi ${message.author.username} `) 
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
    channel.send(`:fries: :fries: :fries: Bienvenu sur notre serveurdiscord, ${member} :fries: :fries: :fries:`);
})

client.on('message', message => {
    message.channel.sendEmbed(help_embed);
    if (message.content === 'e!help'){
            var help_embed = new Discord.RichEmbed()
                .setColor('#FEFEFE')
                .addField('Commandes du bot !', '   - help : Affiche les commandes du bot !')
                .setThumbnail('https://dvcac.org/sites/default/files/internet%20help.jpg')
                .addField('*', '!')
                .addField('*', '!')
                .addField('*', '!')
                .addField('Musique', "-'!add' le nom de la musique ou le lien.                                                                   -'!play' le bot rejoin et joue sur votre channel.                                                                       -'!volume' change le volume entre 0 et 100.                                                                       -'!stop' Arrète la musique")
                .setFooter('By LewanIngame')
            message.channel.sendEmbed(help_embed);
        }
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
