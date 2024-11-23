const { openTerminal } = require('./utils/launchUtils');
const debug = false;

const playerCount = parseInt(process.env.PLAYER_COUNT || '0', 10);
const startingPort = parseInt(process.env.STARTING_PORT || '0', 10);

// Open the specified number of terminal windows
for (let i = 1; i <= playerCount; i++) {
    const port = startingPort + i - 1;
    openTerminal(`node --env-file=.bonus.env player.js ${port} custom`, debug);
}
