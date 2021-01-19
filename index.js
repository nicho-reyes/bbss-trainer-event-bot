require('dotenv').config();

const Discord = require('discord.js');
const bot = new Discord.Client();
const admin = require("firebase-admin");
const gambling = require('./gambling');
const trainers = require('./trainers');
const dbCredentials = JSON.parse(process.env.DB_CRED);
const utils = require('./utils')

let serverAllowedAccess = false;

const restricted = ['ActiveServer', 'PremiumAccess'];

const ADD_TRAINER_SYNTAX_WRAPPER = /\[.*?\]/g;

admin.initializeApp({
    credential: admin.credential.cert(dbCredentials),
    databaseURL: process.env.DB_NAME
});

const db = admin.database().app.database();

const commands = ['$gamble', '!trainer', '!trainer-add', '!servers', '$records'];

bot.login(process.env.DJS_TOKEN);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);

    trainers.getAllURTrainers().forEach(v => commands.push(`$${v.toLowerCase()}`));
});

bot.on('message', async (msg) => {

    const serverID = msg.guild.id;
    const userID = msg.author.id;
    const currentDate = Number(new Date());

    const channelMsg = msg.content.toLowerCase();
    const command = commands.find(c => c === channelMsg.split(' ')[0]);

    if (command != null) {

        // Admin
        if (command === '!servers' && msg.author.id === '353506524859072513') {
            getServerList(msg);
        } else if (command.startsWith('!')) { // Normal commands
            if (channelMsg.startsWith('!trainer-add')) {
                const matchers = channelMsg.replace('!trainer-add', '').match(ADD_TRAINER_SYNTAX_WRAPPER);

                if (matchers != null && matchers.length === 3) {
                    if (restricted.find(v => matchers[0].toLowerCase() === `[${v.toLowerCase()}]`) == null) {
                        await storeTrainerEvent(matchers[0], matchers[1], matchers[2], msg.author.username);
                    } else {
                        console.info(serverID, msg.guild.name, `${userID} ${msg.author.username} is trying to do some restricted commands`);
                        msg.channel.send(`<@${userID}> This trainer name is not allowed`);
                        return;
                    }
                    msg.channel.send(`<@${userID}> trainer event has been added, thank you! :heart_eyes:`);
                } else {
                    msg.channel.send(`<@${userID}> Syntax is invalid please following:\n` + "```" + '!trainer-add [trainer-name] [eventname] [event rewards]' + "```");
                }
            } else if (channelMsg.startsWith('!trainer')) {
                const trainerName = utils.toTitleCase(channelMsg.replace('!trainer', '').toUpperCase().trim());
                db.ref(trainerName).once('value').then((snapshot) => {
                    const trainerEvent = snapshot.val();
                    if (trainerEvent != null) {
                        const arrEvents = getEvent(trainerEvent);
                        msg.channel.send(arrEvents.join(''));
                    }
                });
            }
        } else if (command.startsWith('$')) { // premium pulls

            if (!serverAllowedAccess && (await Promise.resolve(getServerAccess(serverID))) == null) {
                console.info(serverID, msg.guild.name, 'restricted');
                msg.channel.send(`<@${userID}> This is a premium command, and your server does not have permission, for premium features access you may contact the creator of this bot (mreggplant/badoodles)`);
                return;
            } else {
                serverAllowedAccess = true;
            }

            if (command.startsWith('$records')) {
                const requestID = msg.mentions.users.first() != null ? msg.mentions.users.first().id : userID;
                await gambling.getUserGamblingSummary(db, serverID, requestID, msg);
            } else {
                await gambling.doGamble(db, serverID, userID, msg, command, currentDate);
            }
        }
    }
});

async function getServerAccess(serverID) {
    return await db.ref(`PremiumAccess/${serverID}`).once('value').then(async (snapshot) => {
        return snapshot.val();
    });
}

function storeTrainerEvent(trainerName, eventName, eventRewards, authorName) {
    db.ref(`${removeWrapperSyntax(trainerName)}`).update({[removeWrapperSyntax(eventName)]: `${removeWrapperSyntax(eventRewards)} \n entry made by ${authorName}`});
}

function removeWrapperSyntax(str) {
    return utils.toTitleCase(str).trim().replace('[', '').replace(']', '');
}

function getEvent(trainerEvent) {
    const eventArr = [];
    Object.keys(trainerEvent).forEach(key => {
        let eventEffect = '';
        if (typeof trainerEvent[key] === 'object') {
            eventEffect = `***${key}***: ` + "```";
            Object.keys(trainerEvent[key]).forEach(eventKey => {
                eventEffect += `${eventKey}: ${trainerEvent[key][eventKey]} \n`;
            });
            eventEffect += "```";
        } else if (typeof trainerEvent[key] === 'string') {
            eventEffect = `***${key}***: ` + "```" + trainerEvent[key] + "```\n";
        }
        eventArr.push(eventEffect);
    });
    return eventArr;
}

function getServerList(msg) {
    let serverList = ''
    bot.guilds.forEach((guild) => {
        serverList = serverList.concat(guild.name + ": ID: " + guild.id + "\n")
    })
    msg.channel.send("```" + serverList + "```");
}