const Discord = require('discord.js');
const bot = new Discord.Client();
const trainerEvents = require('./events.json');
const events = JSON.parse(JSON.stringify(trainerEvents).toUpperCase());

const eventEffects = ['AFFINITY', 'STR', 'MOOD', 'STAMINA', 'DEX', 'INT', 'MNT', 'SP', 'SKILL DISCOUNT', 'GP'];

bot.login(process.env.DJS_TOKEN);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
    if (msg.content.toLowerCase().startsWith("!trainer")) {
        const trainerName = msg.content.replace('!trainer', '').toUpperCase().trim();
        const trainerEvent = events[trainerName];
        if (trainerEvent != null && trainerEvent != undefined) {
            const arrEvents = getEvent(trainerEvent);
            msg.channel.send(arrEvents.join(''));
        }
    }
});


function getEvent(trainerEvent) {
    const eventArr = [];
    Object.keys(trainerEvent).forEach(key => {
        let eventEffect = `***${key}***: ` + "```";
        Object.keys(trainerEvent[key]).forEach(eventKey => {
            eventEffect += `${eventKey}: ${trainerEvent[key][eventKey]} \n`;
        });
        eventEffect += "```";
        eventArr.push(eventEffect);
    });
    return eventArr;
}
