const trainers = require('./trainers');

function roll(specific, trainerName) {
    const trainerPool = specific ? trainers.getSpecificTrainers(trainerName) : trainers.getAllTrainers();
    // [0..1) * sum of weight
    let sample =
        Math.random() *
        trainerPool.reduce((sum, {weight}) => sum + weight, 0);

    // first sample n where sum of weight for [0..n] > sample
    const {value, weight, rarity} = trainerPool.find(
        ({weight}) => (sample -= weight) < 0
    );

    return {value, weight, rarity};
}

const pull = function (urTrainer, specific, userDetails) {

    // initialize pity count
    if (userDetails.ssrPity == null) {
        userDetails.ssrPity = 0;
    }
    if (userDetails.urPity == null) {
        userDetails.urPity = 0;
    }

    const pullResult = [];
    let rTrainerCount = 0;
    for (let i = 0; i <= 10; i++) {
        let rollResult = roll(specific, urTrainer);

        // check for pity
        if (userDetails.urPity === 200) {
            while (rollResult.rarity !== 'UR') {
                rollResult = roll(specific, urTrainer);
                rollResult.guaranteed = true;
            }
        } else if (userDetails.ssrPity === 35) {
            while (rollResult.rarity !== 'SSR') {
                rollResult = roll(specific, urTrainer);
                rollResult.guaranteed = true;
            }
        }

        if (rTrainerCount === 9) {
            // re-roll gacha, must have min of 2 sr trainers
            while (rollResult.rarity === 'R') {
                rollResult = roll(specific, urTrainer);
            }
        }

        if (rollResult.rarity === 'R') {
            rTrainerCount += 1;
        }

        if (rollResult.rarity === 'SSR') {
            userDetails.ssrPity = 0;
        } else {
            ++userDetails.ssrPity;
        }

        if (rollResult.rarity === 'UR' && trainers.urTrainers.find(v => v.toLowerCase() === urTrainer.toLowerCase()) != null) {
            rollResult.value = urTrainer;
            userDetails.urPity = 0;
        } else {
            ++userDetails.urPity;
        }

        pullResult.push(rollResult);
    }
    return pullResult;
}

module.exports.roll = roll
module.exports.pull = pull