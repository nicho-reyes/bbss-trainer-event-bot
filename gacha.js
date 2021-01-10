const trainers = require('./trainers');

function roll() {
    const trainerPool = trainers.getAllTrainers();
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

const pull = function (urTrainer) {
    const pullResult = [];
    let rTrainerCount = 0;
    for (let i = 0; i <= 10; i++) {
        let rollResult = roll();

        if (rTrainerCount === 8) {
            // re-roll gacha, must have min of 3 sr trainers
            while (rollResult.rarity === 'R') {
                rollResult = roll();
            }
        }

        if (rollResult.rarity === 'R') {
            rTrainerCount += 1;
        }

        if (rollResult.rarity === 'UR' && trainers.urTrainers.find(v => v.toLowerCase() === urTrainer.toLowerCase()) != null) {
            rollResult.value = urTrainer;
        }

        pullResult.push(rollResult);
    }
    return pullResult;
}

module.exports.roll = roll
module.exports.pull = pull