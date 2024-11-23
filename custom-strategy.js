const randomStrategy = require('./random-strategy');
const { mostOccurringValue } = require('./utils/helpers');
const moveMemory = 100;

exports.name = 'custom';

const histories = {};

const bestOpposingMove = move => {
    //game logic
    switch (move) {
        case 'rock':
            return 'paper';
        case 'paper':
            return 'scissors';
        case 'scissors':
            return 'rock';
        default:
            return randomStrategy.makeShot();
    }
};

exports.recordShot = (playerId, shot) => {
    if (!histories[playerId]) {
        histories[playerId] = [];
    }
    //record move for opponent
    histories[playerId].push(shot);

    //limit memory of moves
    if (histories[playerId].length > moveMemory) {
        histories[playerId].length = moveMemory;
    }
};

exports.makeShot = playerId => {
    const opponentHistory = histories[playerId] || [];
    const opponentsCommonMove = mostOccurringValue(opponentHistory);
    const bestMove = bestOpposingMove(opponentsCommonMove);

    return bestMove;
};
