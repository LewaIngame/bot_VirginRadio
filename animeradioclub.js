const Discord = require("discord.js");
const client = new Discord.Client();
var config = require("./config.json");
const request = require("request");
const sql = require("sqlite");
sql.open("./guilds.sqlite");
sql.open("./time.sqlite");
var date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
var myDate = date.substr(0, 10);

const version = "3.1"

let listeners = 0;

client.on('ready', () => {
    var playing = ["Anime songs", `on ${client.guilds.size.toLocaleString()} servers`, "Type >help"]
    var interval = setInterval(function() {
        var game = Math.floor((Math.random() * playing.length) + 0);
        client.user.setGame(playing[game], "Radio")
    }, 35 * 1000);
    console.log("BOT OK")
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

    if (message.author.bot) return;
    sql.get(`SELECT * FROM guilds WHERE guildId ="${message.guild.id}"`).then(row => {
        const prefix = row.prefix;
        const args = message.content.split(" ");
        let command = args[0];
        command = command.slice(prefix.length)
        if (!message.content.startsWith(prefix)) return;
        var reason1 = args.slice(1).join(" ");

        if (command === "ping") {
            message.channel.send("Ping?").then(message => {
                message.edit(`Pong! - ${Math.round(client.ping)} ms`);
            });
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

        if (command === "list") {
            const embed = new Discord.RichEmbed()
                .setColor(3447003)
                .addField('Liste des Radio:', '`1`: Virgin radio')
                .setThumbnail(client.user.avatarURL)

            message.channel.sendEmbed(embed)
        }

        if (command === "play") {
            const voiceChannel = message.member.voiceChannel;
            if (!voiceChannel) {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('Error!', "Je ne te trouve dans aucun channel vocal ")

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
                    .addField('Success!', "Je joue desormais Virgin Radio dans le channel" + message.member.voiceChannel)

                message.channel.sendEmbed(embed);
                message.member.voiceChannel.join().then(connection => {
                    require('http').get("http://vr-live-mp3-64.scdn.arkena.com/virginradio.mp3", (res) => {
                        connection.playStream(res);
                    })
                })
                return
            }
            const embed = new Discord.RichEmbed()
                .setColor("#ff0000")
                .addField('Error!', "Radio inexistante!")

            message.channel.sendEmbed(embed)
        }

        if (command === "leave") {
            if (message.member.voiceChannel) {
                const embed = new Discord.RichEmbed()
                    .setColor("#68ca55")
                    .addField('Success!', "J'ai quiter le channel vocal!")

                message.channel.sendEmbed(embed);
                message.member.voiceChannel.leave();
                return
            }
            else {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('Error!', "Tu n'est actuelement pas dans un channel vocal!")

                message.channel.sendEmbed(embed)
                return
            }
        }

        if (command === "volume") {
            const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == message.guild.id);
            if (voiceConnection === null) {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('Error!', "Je ne suis pas dans un channel vocal pour faire ceci!")

                message.channel.sendEmbed(embed)
                return
            }

            // Get the dispatcher
            const dispatcher = voiceConnection.player.dispatcher;

            if (args[1] > 200 || args[1] < 0) {
                const embed = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .addField('Error!', "Volume doit être 0-200!")

                message.channel.sendEmbed(embed)
                return
            }

            const embed = new Discord.RichEmbed()
                .setColor("#68ca55")
                .addField('Success!', `Volume mit à  \`${args[1]}\``)

            message.channel.sendEmbed(embed);
            dispatcher.setVolume((args[1] / 100));
        }

        if (command === "help") {
            const embed = new Discord.RichEmbed()
                .setColor(3447003)
                .addField('Command List: ',' `help`: Affiche ce message. \n\
                `setprefix`: Définit le préfixe de votre guilde. \n\
                `updates`: affiche les notes de mise à jour afin que vous sachiez quoi de neuf dans cette version du bot. \n\
                `play <numéro de radio>`: Lit une station de radio. \n\
                `leave`: Faire que le bot quitte le canal. \n\
                `list`: Répertorie les stations de radio possibles à lire. \n\
                `volume <0-200>`: Définit le volume pour le bot. \n\
')
                .setThumbnail(client.user.avatarURL)

            message.channel.sendEmbed(embed)
        }

    });
});

client.login(config.token);
