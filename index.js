const Discord = require('discord.js');
const bot = new Discord.Client();
const gacha = require('./gacha');

const admin = require("firebase-admin");
const serviceAccount = require("./admin.json");
const Canvas = require('canvas');
const gamblingCD = 10000;
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://bbss-2020-trainer-events-default-rtdb.firebaseio.com"
});

const db = admin.database().app.database();

bot.login(process.env.DJS_TOKEN);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', async (msg) => {

    const serverID = msg.guild.id;
    const userID = msg.author.id;
    const currentDate = Number(new Date());

    const channelMsg = msg.content.toLowerCase();
    if (channelMsg.startsWith("!trainer")) {
        const trainerName = toTitleCase(channelMsg.replace('!trainer', '').toUpperCase().trim());
        db.ref(trainerName).once('value').then((snapshot) => {
            const trainerEvent = snapshot.val();
            if (trainerEvent != null) {
                const arrEvents = getEvent(trainerEvent);
                msg.channel.send(arrEvents.join(''));
            }
        });
    } else if (channelMsg.startsWith("$gamble") || channelMsg === '$kunio') {
        let userDetails = await Promise.resolve(getUserGamblingDetails(serverID, userID));
        if (allowUserGamblingCommand(userDetails)) {

            // initialize for new user
            if (userDetails == null) {
                userDetails = {};
            }
            const trainerName = toTitleCase(channelMsg.replace('$gamble', '').toUpperCase().trim());
            const result = gacha.pull(trainerName, channelMsg === '$kunio');
            let counter = 0;
            const canvas = Canvas.createCanvas(550, 400);
            const ctx = canvas.getContext('2d');
            let canvasDX = 0;
            let canvasDY = 0;
            let rollMsg = '```';
            const rRolls = [];
            const srRolls = [];
            const ssrRolls = [];
            const urRolls = [];
            result.forEach(item => {
                db.ref('GachaImg/' + item.value).once('value').then(async (snapshot) => {
                    const trainerImgLink = snapshot.val() != null ? snapshot.val().toString() : '';
                    if (trainerImgLink !== '') {
                        const img = await Canvas.loadImage(trainerImgLink);
                        ctx.drawImage(img, canvasDX, canvasDY, 128, 128);

                        if (item.rarity === 'R') {
                            rRolls.push(item.value);
                        } else if (item.rarity === 'SR') {
                            srRolls.push(item.value);
                        } else if (item.rarity === 'SSR') {
                            ssrRolls.push(item.value);
                        } else if (item.rarity === 'UR') {
                            urRolls.push(item.value);
                        }
                    } else {
                        console.error(item);
                    }

                    counter += 1;

                    if (counter === result.length) {

                        if (rRolls.length > 0) {
                            rollMsg += `\n R Trainers => [${rRolls.join(', ')}]`
                        }

                        if (srRolls.length > 0) {
                            rollMsg += `\n SR Trainers => [${srRolls.join(', ')}]`
                        }

                        if (ssrRolls.length > 0) {
                            rollMsg += `\n SSR Trainers => [${ssrRolls.join(', ')}]`
                        }

                        if (urRolls.length > 0) {
                            rollMsg += `\n UR Trainers => [${urRolls.join(', ')}]`
                        }

                        const doubleUR = urRolls.length > 1;
                        rollMsg += '```';
                        const rPullCount = userDetails.rPullCount != null ? userDetails.rPullCount + rRolls.length : rRolls.length;
                        const srPullCount = userDetails.srPullCount != null ? userDetails.srPullCount + srRolls.length : srRolls.length;
                        const ssrPullCount = userDetails.ssrPullCount != null ? userDetails.ssrPullCount + ssrRolls.length : ssrRolls.length;
                        const urPullCount = userDetails.urPullCount != null ? userDetails.urPullCount + urRolls.length : urRolls.length;
                        const totalPullCount = userDetails.TotalPullCount != null ? userDetails.TotalPullCount + 1 : 1;
                        if (userDetails.doubleURCount == null) {
                            // initialize
                            userDetails.doubleURCount = 0;
                        }
                        userDetails.rPullCount = rPullCount;
                        userDetails.srPullCount = srPullCount;
                        userDetails.ssrPullCount = ssrPullCount;
                        userDetails.urPullCount = urPullCount;
                        userDetails.TotalPullCount = totalPullCount;
                        userDetails.LastPull = currentDate;
                        userDetails.doubleURCount = doubleUR ? userDetails.doubleURCount + 1 : userDetails.doubleURCount;

                        const gamblingSummary = "```" + `Total # of UR: ${urPullCount}`
                            + `\nTotal # of Double UR: ${userDetails.doubleURCount}`
                            + `\nTotal # of SSR: ${ssrPullCount}`
                            + `\nTotal # of SR: ${srPullCount}`
                            + `\nTotal # of R: ${rPullCount}`
                            + `\nTotal # of Gambles: ${totalPullCount}` + "```";

                        await storeUserGambling(serverID, userID, userDetails);

                        msg.channel.send(`<@${msg.author.id}> Here are your trainers ${rollMsg}${gamblingSummary}`, {
                            files: [{
                                attachment: canvas.toBuffer()
                            }]
                        }).catch(console.error)
                    }

                    if (canvasDX > 385) {
                        canvasDX = 0;
                        canvasDY += 129;
                    } else {
                        canvasDX += 135;
                    }
                });
            });
        } else {
            msg.delete().then(() => msg.channel.send(`<@${msg.author.id}> You can only use this command once every ${gamblingCD / 1000} seconds`).catch(console.error));
        }
    }
});

function allowUserGamblingCommand(userDetails) {
    if (userDetails == null) {
        return true;
    } else {
        const lastPullDate = userDetails.LastPull;
        const currentDate = Number(new Date());
        return currentDate - lastPullDate > gamblingCD;
    }
}

function storeUserGambling(serverID, userID, userDetails) {
    db.ref(`ActiveServer/${serverID}/${userID}`).set(userDetails);
}

async function getUserGamblingDetails(serverID, userID) {
    return await db.ref(`ActiveServer/${serverID}/${userID}`).once('value').then(async (snapshot) => {
        return snapshot.val();
    });
}

function getMessageColor(rarity) {
    let msgColor = '';
    switch (rarity.toUpperCase()) {
        case 'UR':
            msgColor = "```fix";
            break;
        case 'SSR':
            msgColor = "```diff";
            break;
        case 'SR':
            msgColor = "```cs";
            break;
        case 'R':
            msgColor = "```ini";
            break;
    }
    return msgColor;
}

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