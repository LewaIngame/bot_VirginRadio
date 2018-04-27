const Discord = require("discord.js");
const client = new Discord.Client();
var config = require("./config.json");
const request = require("request");
const sql = require("sqlite");
sql.open("./guilds.sqlite");
sql.open("./time.sqlite");
const prefix = "nrj!"
var date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
var myDate = date.substr(0, 10);

const version = "3.1"

let listeners = 0;

client.on('message', message => {
  if (message.author.bot){ return; }
  if (!message.content.startsWith(prefix)) { return;}
  if (silenced[message.author.id]) { return;}
  let command = message.content.split(" ")[0];
  command = command.slice(prefix.length);
  let args = message.content.split(" ").slice(1);
  if (command === prefix + "ping") {
    startTime = Date.now();
  message.channel.sendMessage("Calcul en cours...").then((message) => {
    endTime = Date.now();
     message.edit("**Bot :** *" + Math.round(endTime - startTime) + "* **ms**\n**API** : *"+Math.round(client.ping)+"* **ms**");
  }
})

client.on('ready', () => {
    var playing = ["Anime songs", `on ${client.guilds.size.toLocaleString()} servers`, "Type >help to get started!", "http://animeradioclub.com/"]
    var interval = setInterval(function() {
        var game = Math.floor((Math.random() * playing.length) + 0);
        client.user.setGame(playing[game], "https://www.twitch.tv/24_7_chill_piano")
    }, 35 * 1000);
    console.log("Anime Radio Club, rolling out!")
});

setInterval(() => {
    try {
        listeners = client.voiceConnections
            .map(vc => vc.channel.members.filter(me => !(me.user.bot || me.selfDeaf || me.deaf)).size)
            .reduce((sum, members) => sum + members);
    }
    catch (error) {
        listeners = 0;
    }
}, 30000);


client.on("message", message => {
    if (message.channel.type === 'dm') return;
    if (message.channel.type !== 'text') return;
    sql.get(`SELECT * FROM guilds WHERE guildId ="${message.guild.id}"`).then(row => {
        if (!row) {
            sql.run("INSERT INTO guilds (guildId, prefix) VALUES (?, ?)", [message.guild.id, ">"]);
        }
    }).catch(() => {
        console.error;
        sql.run("CREATE TABLE IF NOT EXISTS guilds (guildId TEXT, prefix TEXT)").then(() => {
            sql.run("INSERT INTO guilds (guildId, prefix) VALUES (?, ?)", [message.guild.id, ">"]);
        });
    });
    sql.get(`SELECT * FROM time WHERE userId ="${message.author.id}"`).then(row => {
        if (!row) {
            sql.run("INSERT INTO time (userId, date, amount) VALUES (?, ?, ?)", [message.author.id, '0000-00-00', 1]);
        }
    }).catch(() => {
        console.error;
        sql.run("CREATE TABLE IF NOT EXISTS time (userId TEXT, date TEXT, amount INTEGER)").then(() => {
            sql.run("INSERT INTO time (userId, date, amount) VALUES (?, ?, ?)", [message.author.id, '0000-00-00', 1]);
        });
    });

        if (command === "restart") {
            if (message.author.id === config.owner) {
                message.channel.send(":wave: Rebooting!")
                setTimeout(function() {
                    process.exit(1);
                }, 3 * 1000)
            }
            else {
                message.channel.send("Tu dois être le créateur")
            }
        }

        if (command === "setprefix") {
            if (message.author.id === config.owner) {
                const newPrefix = args[1];
                sql.run(`UPDATE guilds SET prefix = replace(prefix, '${row.prefix}', '${newPrefix}') WHERE guildId = ${message.guild.id}`);
                const embed = new Discord.RichEmbed()
                    .setColor("#68ca55")
                    .addField('Success:', `The prefix for **${message.guild.name}** is now **${newPrefix}**`)

                message.channel.sendEmbed(embed);
                return
            }
            if (!message.member.hasPermission("ADMINISTRATOR")) {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('No Permissions:', "I'm sorry, but you don't have the `ADMINISTRATOR` permission to use this command.")

                message.channel.sendEmbed(embed);
                return
            }
            const newPrefix = args.slice(1).join(" ");
            sql.run(`UPDATE guilds SET prefix = replace(prefix, '${row.prefix}', '${newPrefix}') WHERE guildId = ${message.guild.id}`);
            const embed = new Discord.RichEmbed()
                .setColor("#68ca55")
                .addField('Success:', `The prefix for **${message.guild.name}** is now **${newPrefix}**`)

            message.channel.sendEmbed(embed);
        }

        if (command === "updates") {
            const embed = new Discord.RichEmbed()
                .setColor(3447003)
                .setAuthor('Update Notes', client.user.avatarURL)
                .addField(`What's new in Version ${version}:`, `- Added in leave command to help (forgot about doing so for ages)`)
                .addField(`What was new in Previous Version:`, `- Suggestion command`)

            message.channel.sendEmbed(embed)
        }

        if (command === "request") {
            sql.get(`SELECT * FROM time WHERE userId ="${message.author.id}"`).then(row => {
                if (row.date !== myDate) {
                    sql.run(`UPDATE time SET amount = 0 WHERE userId = ${message.author.id}`);
                    sql.run(`UPDATE time SET date = "0000-00-00" WHERE userId = ${message.author.id}`);
                }
                if (row.amount === 4) {
                    const embed = new Discord.RichEmbed()
                        .setColor("#ff0000")
                        .addField('Daily Max Reached!', "You have used up all 3 of your daily station suggestions, please wait until tomorrow to use this command again.")
                        .setFooter(`Command was used on ${row.date}. Today is ${myDate}`)

                    message.channel.sendEmbed(embed)
                    return
                }
                if (!args.slice(1).join(" ")) {
                    const embed = new Discord.RichEmbed()
                        .setColor("#ff0000")
                        .addField('Empty message!', "You must input a radio station you want to request to be added in! You cannot leave it blank.")

                    message.channel.sendEmbed(embed)
                    return
                }
                if (row.amount >= 0 && row.amount <= 4 && row.date === "0000-00-00") {
                    sql.run(`UPDATE time SET date = "${myDate}" WHERE userId = ${message.author.id}`);
                    sql.run(`UPDATE time SET amount = ${row.amount + 1} WHERE userId = ${message.author.id}`);
                    const embed = new Discord.RichEmbed()
                        .setColor("#68ca55")
                        .addField('Suggestion sent!', "That radio station will be considered.")
                        .setFooter(`Used ${row.amount}/3 daily suggestions.`)

                    message.channel.sendEmbed(embed);
                    const embed1 = new Discord.RichEmbed()
                        .setTimestamp()
                        .setColor(3447003)
                        .addField('New Feedback!', `${message.author.username}#${message.author.discriminator} has sent in a suggestion!`)
                        .addField('Suggestion:', `${args.slice(1).join(" ")}`)
                        .addField('Server:', `${message.guild.name} (${message.guild.id})`)
                        .setThumbnail(client.user.avatarURL)

                    client.channels.find("id", `397705396518912020`).sendEmbed(embed1)
                    return
                }
                if (row.amount >= 0 && row.amount <= 4) {
                    sql.run(`UPDATE time SET amount = ${row.amount + 1} WHERE userId = ${message.author.id}`);
                    const embed = new Discord.RichEmbed()
                        .setColor("#68ca55")
                        .addField('Suggestion sent!', "That radio station will be considered.")
                        .setFooter(`Used ${row.amount}/3 daily suggestions.`)

                    message.channel.sendEmbed(embed);
                    const embed1 = new Discord.RichEmbed()
                        .setTimestamp()
                        .setColor(3447003)
                        .addField('New Feedback!', `${message.author.username}#${message.author.discriminator} has sent in a suggestion!`)
                        .addField('Suggestion:', `${args.slice(1).join(" ")}`)
                        .addField('Server:', `${message.guild.name} (${message.guild.id})`)
                        .setThumbnail(client.user.avatarURL)

                    client.channels.find("id", `397705396518912020`).sendEmbed(embed1)
                    return
                }
            });
        }

        if (command === "list") {
            const embed = new Discord.RichEmbed()
                .setColor(3447003)
                .addField('RListe des radio:', '`1`: NRJ')
                .addField(':', '`2`: NRJ')
                .setThumbnail(client.user.avatarURL)

            message.channel.sendEmbed(embed)
        }

        if (command === "play") {
            const voiceChannel = message.member.voiceChannel;
            if (!voiceChannel) {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('Error!', "Impossible ou est tu ?")

                message.channel.sendEmbed(embed)
                return
            }
            if (!args[1]) {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('Error!', "Aucune radio selectionner!")

                message.channel.sendEmbed(embed)
                return
            }
            if (args[1] === "1") {
                const embed = new Discord.RichEmbed()
                    .setColor("#68ca55")
                    .addField('Success!', "Je joue NRJ " + message.member.voiceChannel)

                message.channel.sendEmbed(embed);
                message.member.voiceChannel.join().then(connection => {
                    require('http').get("http://185.52.127.155/fr/30001/mp3_128.mp3?origine=fluxradios", (res) => {
                        connection.playStream(res);
                    })
                })
                return
            }
           if (args[1] === "1") {
                const embed = new Discord.RichEmbed()
                    .setColor("#68ca55")
                    .addField('Success!', "Je joue Virgin radio " + message.member.voiceChannel)

                message.channel.sendEmbed(embed);
                message.member.voiceChannel.join().then(connection => {
                    require('http').get("http://vr-live-mp3-128.scdn.arkena.com/virginradio.mp3", (res) => {
                        connection.playStream(res);
                    })
                })
                return
            }
            const embed = new Discord.RichEmbed()
                .setColor("#ff0000")
                .addField('Error!', "Radio does not exist!")

            message.channel.sendEmbed(embed)
        }

        if (command === "leave") {
            if (message.member.voiceChannel) {
                const embed = new Discord.RichEmbed()
                    .setColor("#68ca55")
                    .addField('Success!', "Voice channel successfully left!")

                message.channel.sendEmbed(embed);
                message.member.voiceChannel.leave();
                return
            }
            else {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('Error!', "You are currently not in a voice channel!")

                message.channel.sendEmbed(embed)
                return
            }
        }

        if (command === "volume") {
            const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == message.guild.id);
            if (voiceConnection === null) {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('Error!', "Currently not in a voice channel!")

                message.channel.sendEmbed(embed)
                return
            }

            // Get the dispatcher
            const dispatcher = voiceConnection.player.dispatcher;

            if (args[1] > 200 || args[1] < 0) {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('Error!', "Volume out of range! Must be 0-200!")

                message.channel.sendEmbed(embed)
                return
            }

            const embed = new Discord.RichEmbed()
                .setColor("#68ca55")
                .addField('Success!', `Volume set to \`${args[1]}\``)

            message.channel.sendEmbed(embed);
            dispatcher.setVolume((args[1] / 100));
        }

        if (command === "help") {
            const embed = new Discord.RichEmbed()
                .setColor(3447003)
                .addField('Command List:', '`help`: Displays this message.\n\
`donate`: Grab the donate link.\n\
`ping`: Pong!\n\
`stats`: Check Anime Radio Club\'s stats.\n\
`setprefix`: Set the prefix for your guild.\n\
`invite`: Grab the invite links for the bot.\n\
`website`: Grab the website and github link for the bot.\n\
`updates`: Displays the update notes so you know what\'s new in this version of the bot.\n\
`restart`: Restart the bot (Only for bot owner).\n\
`play <radio number>`: Plays a radio station.\n\
`leave`: Make the bot leave the channel.\n\
`list`: Lists the possible radio stations to be played.\n\
`volume <0-200>`: Set\'s the volume for the bot.\n\
`request`: Request a suggestion for a radio station to be added in. (Limited to using this command 3 times a day).\n\
                .setThumbnail(client.user.avatarURL)

            message.channel.sendEmbed(embed)
        }

    });
});
    
 client.on('message', message => {
      if (command === prefix + "info") {
    const os = require('os');
    var iconURL = ""
  console.log("▬▬▬▬ LOGS ▬▬▬▬\nUser ID :"+message.author.id+"\nServer: "+message.guild.name+"\nUsername: "+message.author.username+"\nCommand: k!bs\n ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ ")
  let upTime = Math.round(os.uptime());
 let upTime1 = Math.round(process.uptime());
     let upTimeSeconds2 = upTime1;
        let upTimeOutput2 = "";
        if (upTime<60) {
            upTimeOutput2 = `${upTime1}s`;
        } else if (upTime1<3600) {
            upTimeOutput2 = `${Math.floor(upTime1/60)} minutes ${upTime1%60} secondes`;
        } else if (upTime1<86400) {
            upTimeOutput2 = `${Math.floor(upTime1/3600)} heures ${Math.floor(upTime1%3600/60)} minutes ${upTime1%3600%60} secondes`;
        } else if (upTime1<604800) {
            upTimeOutput2 = `${Math.floor(upTime1/86400)} jours ${Math.floor(upTime1%86400/3600)} heures ${Math.floor(upTime1%86400%3600/60)} minutes ${upTime%86400%3600%60} secondes`;
        }
         let upTimeSeconds = upTime;
        let upTimeOutput = "";

        if (upTime<60) {
            upTimeOutput = `${upTime} secondes`;
        } else if (upTime<3600) {
            upTimeOutput = `${Math.floor(upTime/60)} minutes ${upTime%60} secondes`;
        } else if (upTime<86400) {
            upTimeOutput = `${Math.floor(upTime/3600)} heures ${Math.floor(upTime%3600/60)} minutes ${upTime%3600%60} secondes`;
        } else if (upTime<604800) {
            upTimeOutput = `${Math.floor(upTime/86400)} jours ${Math.floor(upTime%86400/3600)} heures ${Math.floor(upTime%86400%3600/60)} minutes ${upTime%86400%3600%60} secondes`;
        }
let embed_fields = [{
                name: "Informations Système",
                value: `Plateforme : ${process.platform}-${process.arch}\n ${process.release.name}\n Version : ${process.version.slice(1)}\n`,
                inline: true
            },
            {
                name: "Utilisation de la mémoire du processeur",
                value: `${Math.ceil(process.memoryUsage().heapTotal / 1000000)} MB`,
                inline: true
            },
            {
                name: "Utilisation de la mémoire du système",
                value: `${Math.ceil((os.totalmem() - os.freemem()) / 1000000)} / ${Math.ceil(os.totalmem() / 1000000)} MB`,
                inline: true
            },
            {
                name: "Durée de fonctionnement de l'ordinateur",
                value: `:clock12: ${upTimeOutput}`,
                inline: true
            },
            {
                name: "Durée de fonctionnement du bot",
                value: `:clock1230: ${upTimeOutput2}`,
                inline: true
            },

        message.channel.send({
            embed: {
                author: {
                    name: "NRJ BOT",
                    url:'https://google.fr/'
                },
                color: 0xFFFFFF,
                fields: embed_fields
            }
        });
  }

});

client.login(config.token);
