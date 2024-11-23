const { loopStrategy, openTerminal } = require('./utils/launchUtils');
const debug = false;
const strategyPattern = ['constant', 'random', 'custom'];

const playerCount = parseInt(process.env.PLAYER_COUNT || '0', 10);
const startingPort = parseInt(process.env.STARTING_PORT || '0', 10);

// Open the specified number of terminal windows
for (let i = 0; i < playerCount; i++) {
    const port = startingPort + i;
    openTerminal(`node --env-file=.env player.js ${port} ${loopStrategy(i, strategyPattern)}`, debug);
}
