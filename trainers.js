const highRateUR = ['Ditto', 'Valentine', 'Belita', 'Dragona', 'Regret', 'Leon', 'Rowena', 'Leonie', 'Pluto', 'Clefina',
    'Rachel', 'Luther', 'Britra', 'Chael', 'Seiryu', 'Kai', 'Nina', 'Sohyang', 'Eve'];

const midRateUR = ['Ara', 'Luna', 'Flamesh', 'Helga', 'Tsubaki', 'Michaella', 'Ines'];

const lowRateUR = ['Violet', 'Psyker', 'Roy', 'Lilith', 'King Tiger'];

const highRateSSR = ['Yomi', 'Boomiger', 'Onestone', 'Base Angel', 'Hellfire', 'Lucia', 'Bora', 'Soldia', 'Hunter G', 'Captain Jack',
    'Aliana', 'MK-3', 'Scumbag Joe', 'Medica', 'Velour', 'Guy-E', 'Liew', 'Basedevil', 'Elfin', 'Golden Boy', 'Helen', 'Tauric', 'Base Hero', 'Mei Mei', 'Magnus'];

const midRateSSR = ['Zena', 'Mia', 'Kryzer', 'Pi', 'Policia', 'NOM', 'Albert', 'Nameless', 'Sophie', 'Zia']

const lowRateSSR = ['Zhizi', 'Psyche', 'Miho', 'Rose', 'Miho', 'Allen', 'Lucy', 'Monique']

const highRateSR = ['Aqualord', 'Firelord', 'Casta', 'Lilo', 'Magmizer', 'Venomizer', 'Serena', 'Snipe', 'Wendell',
    'Gryllson', 'Marcus', 'Reuben', 'Sherlia', 'Dice', 'John Roger', 'Drake', 'Tera', 'Anetta', 'Phrygia', 'Drucker',
    'Brant', 'Eunwoo', 'Liuxia', 'Nio', 'Soun', 'Acro', 'Talas', 'Pale', 'Hell Guy', 'Pazuzu', 'Siren', 'Paris', 'Lina'];

const midRateSR = ['Kalisto', 'Titania', 'Marvel', 'Genie', 'Nahyun', 'Liuxing', 'Gladius', 'Brokel', 'Patricia',
    'Eia', 'Flora', 'Kate', 'Hilary'];

const lowRateSR = ['Amir', 'Lupina', 'Stinger', 'Cami', 'Popo', 'Shuri', 'Wonhee', 'Daisy', 'Zen', 'Rex'];

const rTrainers = ['Roland', 'Nick', 'Kang', 'Zett', 'Liz', 'Eva', 'Sarah', 'Matilda'];

const kunioUR = ['Kunio'];

const bastetUR = ['Bastet'];

const ssrURTrainers = [...highRateSSR, ...midRateSSR, ...lowRateSSR];

const urTrainers = [...lowRateUR, ...midRateUR, ...highRateUR];

function lowTierTrainers(trainers) {
    highRateSSR.forEach(trainer => {
        trainers.push({value: trainer, weight: 0.0949, rarity: 'SSR'})
    });

    midRateSSR.forEach(trainer => {
        trainers.push({value: trainer, weight: 0.0570, rarity: 'SSR'})
    });

    lowRateSSR.forEach(trainer => {
        trainers.push({value: trainer, weight: 0.0190, rarity: 'SSR'})
    });

    lowRateSSR.forEach(trainer => {
        trainers.push({value: trainer, weight: 0.0190, rarity: 'SSR'})
    });

    highRateSR.forEach(trainer => {
        trainers.push({value: trainer, weight: 0.5656, rarity: 'SR'})
    });

    midRateSR.forEach(trainer => {
        trainers.push({value: trainer, weight: 0.3394, rarity: 'SR'})
    });

    lowRateSR.forEach(trainer => {
        trainers.push({value: trainer, weight: 0.1131, rarity: 'SR'})
    });

    rTrainers.forEach(trainer => {
        trainers.push({value: trainer, weight: 8.9375, rarity: 'R'})
    });

    return trainers;
}

function getAllTrainers() {
    return [].concat(lowTierTrainers([]), nonLimitedURTrainers());
}

function getAllURTrainers() {
    return [].concat(urTrainers, kunioUR, bastetUR);
}

function nonLimitedURTrainers() {
    const trainers = [];

    highRateUR.forEach(trainer => {
        trainers.push({value: trainer, weight: 0.0207, rarity: 'UR'})
    });

    midRateUR.forEach(trainer => {
        trainers.push({value: trainer, weight: 0.0124, rarity: 'UR'})
    });

    lowRateUR.forEach(trainer => {
        trainers.push({value: trainer, weight: 0.0041, rarity: 'UR'})
    });

    return trainers;
}

function getSpecificTrainers(limitedTrainer) {
    const trainers = [];

    if (limitedTrainer === 'Kunio') {
        kunioUR.forEach(trainer => {
            trainers.push({value: trainer, weight: 1, rarity: 'UR'})
        });
    } else if (limitedTrainer === 'Bastet') {
        bastetUR.forEach(trainer => {
            trainers.push({value: trainer, weight: .5, rarity: 'UR'})
        });
    } else {
        const specTrainer = urTrainers.find(trainer => trainer === limitedTrainer);
        if (specTrainer !== null) {
            trainers.push({value: specTrainer.value, weight: .5, rarity: 'UR'})
        } else {
            trainers.concat(nonLimitedURTrainers());
        }
    }

    trainers.concat(lowTierTrainers(trainers));

    return trainers;
}

module.exports.highSSRTrainers = highRateSSR;
module.exports.midSSRTrainers = midRateSSR;
module.exports.lowSSRTrainers = lowRateSSR;
module.exports.urTrainers = urTrainers;
module.exports.rTrainers = rTrainers;
module.exports.ssrURTrainers = ssrURTrainers;
module.exports.getAllTrainers = getAllTrainers;
module.exports.getSpecificTrainers = getSpecificTrainers;
module.exports.getAllURTrainers = getAllURTrainers;