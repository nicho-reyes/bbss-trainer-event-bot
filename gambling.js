const gacha = require('./gacha');
const Canvas = require('canvas');
const utils = require('./utils')

const gamblingCD = 10000;

function allowUserGamblingCommand(userDetails) {
    if (userDetails == null) {
        return true;
    } else {
        const lastPullDate = userDetails.LastPull;
        const currentDate = Number(new Date());
        return currentDate - lastPullDate > gamblingCD;
    }
}

function storeUserGambling(db, serverID, userID, userDetails) {
    db.ref(`ActiveServer/${serverID}/${userID}`).set(userDetails);
}

async function getUserGamblingDetails(db, serverID, userID) {
    return await db.ref(`ActiveServer/${serverID}/${userID}`).once('value').then(async (snapshot) => {
        return snapshot.val();
    });
}

async function getUserGamblingSummary(db, serverID, userID, msg) {
    const userDetails = await db.ref(`ActiveServer/${serverID}/${userID}`).once('value').then(async (snapshot) => {
        return snapshot.val();
    });
    if (userDetails) {
        const gamblingSummary = "```" + `Total # of UR: ${userDetails.urPullCount}`
            + `\nTotal # of Double UR: ${userDetails.doubleURCount}`
            + `\nTotal # of (Limited) Kunio: ${userDetails.totalKunioCount}`
            + `\nTotal # of (Limited) Bastet: ${userDetails.totalBastetCount}`
            + `\nTotal # of SSR: ${userDetails.ssrPullCount}`
            + `\nTotal # of SR: ${userDetails.srPullCount}`
            + `\nTotal # of R: ${userDetails.rPullCount}`
            + `\nSSR Pity: ${userDetails.ssrPity}`
            + `\nUR Pity: ${userDetails.urPity}`
            + `\nTotal # of Gambles: ${userDetails.TotalPullCount}` + "```";
        msg.channel.send(`<@${userID}> Here are your gambling records ${gamblingSummary}`).catch(console.error);
    } else {
        msg.channel.send(`<@${userID}> Hasn't made any gambling record`).catch(console.error);
    }
}

async function doGamble(db, serverID, userID, msg, command, currentDate) {
    let userDetails = await Promise.resolve(getUserGamblingDetails(db, serverID, userID));
    if (allowUserGamblingCommand(userDetails)) {

        // initialize for new user
        if (userDetails == null) {
            userDetails = {};
        }

        let trainerName = command !== '$gamble' ? utils.toTitleCase(command.substring(1)) : '';

        const result = gacha.pull(trainerName, trainerName !== '', userDetails);
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
        const guaranteedSSR = [];
        const guaranteedUR = [];
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
                        if (item.guaranteed) {
                            guaranteedSSR.push(item.value);
                        } else {
                            ssrRolls.push(item.value);
                        }
                    } else if (item.rarity === 'UR') {
                        if (item.guaranteed) {
                            guaranteedUR.push(item.value);
                        } else {
                            urRolls.push(item.value);
                        }
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
                    const rPullCount = userDetails.rPullCount != null ? userDetails.rPullCount + rRolls.length : rRolls.length;
                    const srPullCount = userDetails.srPullCount != null ? userDetails.srPullCount + srRolls.length : srRolls.length;
                    const ssrPullCount = userDetails.ssrPullCount != null ? userDetails.ssrPullCount + ssrRolls.length + guaranteedSSR.length : ssrRolls.length + guaranteedSSR.length;
                    const urPullCount = userDetails.urPullCount != null ? userDetails.urPullCount + urRolls.length + guaranteedUR.length : urRolls.length + guaranteedUR.length;
                    const totalPullCount = userDetails.TotalPullCount != null ? userDetails.TotalPullCount + 1 : 1;
                    if (userDetails.doubleURCount == null) {
                        // initialize
                        userDetails.doubleURCount = 0;
                    }
                    if (userDetails.totalKunioCount == null) {
                        // initialize
                        userDetails.totalKunioCount = 0;
                    }
                    if (userDetails.totalBastetCount == null) {
                        // initialize
                        userDetails.totalBastetCount = 0;
                    }

                    const kunioPulls = rollMsg.toString().match(/Kunio/g);
                    const bastetPulls = rollMsg.toString().match(/Bastet/g)
                    if (kunioPulls != null) {
                        userDetails.totalKunioCount = userDetails.totalKunioCount + kunioPulls.length;
                    }

                    if (bastetPulls != null) {
                        userDetails.totalBastetCount = userDetails.totalBastetCount + bastetPulls.length;
                    }

                    userDetails.rPullCount = rPullCount;
                    userDetails.srPullCount = srPullCount;
                    userDetails.ssrPullCount = ssrPullCount;
                    userDetails.urPullCount = urPullCount;
                    userDetails.TotalPullCount = totalPullCount;
                    userDetails.LastPull = currentDate;
                    userDetails.doubleURCount = doubleUR ? userDetails.doubleURCount + 1 : userDetails.doubleURCount;

                    rollMsg += guaranteedSSR.length > 0 ? `\n Guaranteed SSR => [${guaranteedSSR.join(', ')}]` : "";
                    rollMsg += guaranteedUR.length > 0 ? `\n Guaranteed UR => [${guaranteedUR.join(', ')}]` : "";
                    rollMsg += '```';
                    const gamblingSummary = "```"
                        + `\nSSR Pity: ${userDetails.ssrPity}`
                        + `\nUR Pity: ${userDetails.urPity}`
                        + `\nTotal # of Gambles: ${totalPullCount}`
                        + "```";

                    await storeUserGambling(db, serverID, userID, userDetails);

                    msg.channel.send(`<@${userID}> Here are your trainers ${rollMsg}${gamblingSummary}`, {
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
        msg.delete().then(() => msg.channel.send(`<@${userID}> You can only use this command once every ${gamblingCD / 1000} seconds`).catch(console.error));
    }
}

module.exports.allowUserGamblingCommand = allowUserGamblingCommand;
module.exports.storeUserGambling = storeUserGambling;
module.exports.getUserGamblingDetails = getUserGamblingDetails;
module.exports.doGamble = doGamble;
module.exports.getUserGamblingSummary = getUserGamblingSummary;