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

module.exports.allowUserGamblingCommand = allowUserGamblingCommand;
module.exports.storeUserGambling = storeUserGambling;
module.exports.getUserGamblingDetails = getUserGamblingDetails;
module.exports.gamblingCD = gamblingCD;