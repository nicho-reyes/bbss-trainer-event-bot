const Discord = require('discord.js');
const bot = new Discord.Client();
const trainerEvents = require('./events.json');
const events = JSON.parse(JSON.stringify(trainerEvents).toUpperCase());


const admin = require("firebase-admin");
const serviceAccount = require("./admin.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://bbss-2020-trainer-events-default-rtdb.firebaseio.com"
});

const db = admin.database().app.database();

bot.login(process.env.DJS_TOKEN);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
    if (msg.content.toLowerCase().startsWith("!trainer")) {
        const trainerName = toTitleCase(msg.content.replace('!trainer', '').toUpperCase().trim());
        console.log(trainerName);
        db.ref(trainerName).once('value').then((snapshot) => {
            const trainerEvent = snapshot.val();
            if (trainerEvent != null) {
                const arrEvents = getEvent(trainerEvent);
                msg.channel.send(arrEvents.join(''));
            }
        });
    }
});

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

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
