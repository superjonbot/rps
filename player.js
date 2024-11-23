const dgram = require('dgram');
const NAMES = require('./names');

// Additional functions for bonus task #1
const {
  mergeObjects,
  omitEntry,
  convertAndSortByValue,
  getObjectsWithSameValue,
  pickRandomEntry,
} = require('./utils/helpers')
// values from .env file
const playerCount = parseInt(process.env.PLAYER_COUNT || '0', 10);
const startingPort = parseInt(process.env.STARTING_PORT || '0', 10);

// @ts-ignore
const availablePorts = Array.from(
  { length: playerCount },
  (v, i) => i + startingPort,
)
let knownPlayGameCount = {}

if (!process.argv[2]) {
    console.error('Missing required port argument');
    process.exit(1);
}

if (!process.argv[3]) {
    console.error('Missing required strategy argument');
    process.exit(1);
}

const port = parseInt(process.argv[2], 10);

if (Number.isNaN(port)) {
    console.error('Invalid port argument', process.argv[2]);
    process.exit(1);
}

let strategy;

try {
    strategy = require(`./${process.argv[3]}-strategy`);
} catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
        console.error('Invalid strategy argument', process.argv[3]);
        process.exit(1);
    }

    throw err;
}

const HOST = 'localhost';

class Logger {
    constructor(name) {
        this.name = name;
    }

    log(...args) {
        console.log(new Date().toISOString(), this.name, ...args);
    }

    warn(...args) {
        console.warn(new Date().toISOString(), this.name, ...args);
    }

    error(...args) {
        console.error(new Date().toISOString(), this.name, ...args);
    }
}

class Player {
    constructor() {
        this.port = port;
        this.id = Player.generateDeviceId();
        this.logger = new Logger(this.id);
        this.onMessage = this.onMessage.bind(this);

        // Are we currently in a game already?
        this.inGame = false;

        // Addresses for other players in the game. (adjustable from .env file)
        this.knownAddresses = availablePorts;

        // Remove the address for this player. We don't want players to play against themselves.
        this.knownAddresses = this.knownAddresses.filter(addr => {
            return addr !== port;
        });

        this.wins = 0;
        this.losses = 0;
        this.ties = 0;
        this.gameCount = 0;
    }

    initialize() {
        this.socket = dgram.createSocket('udp4');

        this.socket.on('message', this.onMessage);

        this.socket.on('listening', () => {
            const address = this.socket.address();
            this.logger.log(`socket listening ${address.address}:${address.port}`);
        });

        this.socket.on('error', (err) => {
            this.logger.error('socket error:');
            this.logger.error(err.stack);
        });

        // Will use localhost by default.
        this.socket.bind(this.port);

        this.timeout = setTimeout(this.tryToPlay.bind(this), 10000);
    }

    onMessage(messageBuffer) {
        const json = messageBuffer.toString();

        const { playerID, port, method, params } = JSON.parse(json);

        this.logger.log(`Received message from ${playerID}: ${method}(${params.join()})`);

        switch (method) {
            case 'readyToPlay':
                //let the player know the history of other players' game count
                this.isReadyToPlay(port, playerID, params[0]);
                break;
            case 'canPlay':
                this.acceptShot(port, playerID, params[0]);
                break;
            case 'cannotPlay':
                // Update the knownPlayGameCount if given by other player
                if (params[0]) {
                    knownPlayGameCount = { ...params[0] };
                }
                // If we invited a player to play, and the player could not play, then try again
                // with a different player after a short delay.
                this.logger.log(playerID, 'cannot play; trying someone else');
                this.tryToPlayRandomDelay();
                break;
            case 'gameResult':
                this.gotGameResult(port, playerID, params[1], params[0]);
                break;
        }
    }

    tryToPlay() {
        const peopleToPlay = omitEntry(knownPlayGameCount, this.id); //omit selfselfrom list
        const peopleToPlaySorted = convertAndSortByValue(peopleToPlay);
        const hasPlayedAllPlayers = peopleToPlaySorted.length === availablePorts.length - 1;
        this.timeout = null;

        // after playing all players, start to prefer playing the player with the least games played
        if (peopleToPlaySorted.length && hasPlayedAllPlayers) {
            const playerToPlay = pickRandomEntry(peopleToPlaySorted);
            const playerToPlayID = playerToPlay[0];
            const playerToPlayParts = playerToPlayID.split('-');
            const playerToPlayPort = playerToPlayParts[playerToPlayParts.length - 1];
            this.sendMessage(Number(playerToPlayPort), 'readyToPlay', [knownPlayGameCount]);
        } else {
            this.sendMessage(this.sampleKnownAddresses(), 'readyToPlay', [knownPlayGameCount]);
        }
    }

    tryToPlayRandomDelay() {
        const maxDelay = 5000;
        const minDelay = 1000;
        const delay = Math.random() * (maxDelay - minDelay) + minDelay;

        this.timeout = setTimeout(this.tryToPlay.bind(this), delay);
    }

    isReadyToPlay(port, playerID, sharedPlayGameCount) {
        //when player is ready to play, share games played
        if (sharedPlayGameCount) {
            knownPlayGameCount = mergeObjects(knownPlayGameCount, sharedPlayGameCount);
        }

        //if player is known to be a frequent player, then refuse to play
        const playersSortedByGames = convertAndSortByValue(knownPlayGameCount, true);
        const playerObjectsWithMostGames = getObjectsWithSameValue(playersSortedByGames);
        const playerNamesWithMostGames = playerObjectsWithMostGames.map(player => player[0]);
        const shouldRefuseGame = playerNamesWithMostGames.includes(this.id);

        if (this.inGame || shouldRefuseGame) {
            this.logger.log(`${playerID} wants to play; already in game or player with most games`);
            this.sendMessage(port, 'cannotPlay', [knownPlayGameCount]); //update challenger's knownPlayGameCount
        } else {
            this.logger.log(`${playerID} wants to play; will send shot`);
            this.inGame = true;
            this.cancelTimeout();

            const shot = strategy.makeShot(playerID);

            this.sendMessage(port, 'canPlay', [shot]);
        }
    }

    acceptShot(port, playerID, shot) {
        this.logger.log(`Player ${playerID} sent:`, shot, '; creating counter shot');

        strategy.recordShot(playerID, shot);

        const counterShot = strategy.makeShot(playerID);
        let result;

        switch (shot) {
            case 'rock':
                if (counterShot === 'paper') {
                    result = 'loss';
                } else if (counterShot === 'rock') {
                    result = 'tie';
                } else {
                    result = 'win';
                }
                break;
            case 'paper':
                if (counterShot === 'scissors') {
                    result = 'loss';
                } else if (counterShot === 'paper') {
                    result = 'tie';
                } else {
                    result = 'win';
                }
                break;
            case 'scissors':
                if (counterShot === 'rock') {
                    result = 'loss';
                } else if (counterShot === 'scissors') {
                    result = 'tie';
                } else {
                    result = 'win';
                }
                break;
        }

        // The result is recorded to inform the *other* player of a win or loss.
        // So, the inverse applies here.
        if (result === 'loss') {
            this.logger.log(`Beat player ${playerID} with counter shot:`, counterShot);
            this.wins++;
        } else if (result === 'tie') {
            this.logger.log(`Tied player ${playerID} with counter shot:`, counterShot);
            this.ties++;
        } else {
            this.logger.log(`Lost to player ${playerID} with counter shot:`, counterShot);
            this.losses++;
        }
        // Record Game Count
        this.gameCount = this.wins + this.losses + this.ties;
        knownPlayGameCount[this.id] = this.gameCount;

        this.logger.log(
            `{ strategy:${strategy.name}, wins:${this.wins}, losses:${this.losses} ties:${this.ties} *${this.id} played ${this.gameCount} games}`
        );

        this.sendMessage(port, 'gameResult', [result, counterShot]);

        this.inGame = false;
        this.tryToPlayRandomDelay();
    }

    gotGameResult(port, playerID, shot, result) {
        if (result === 'win') {
            this.wins++;
            this.logger.log(`Beat player ${playerID} (counter shot ${shot})`);
        } else if (result === 'tie') {
            this.ties++;
            this.logger.log(`Tied player ${playerID} (counter shot ${shot})`);
        } else {
            this.logger.log(`Lost to player ${playerID} (counter shot ${shot})`);
            this.losses++;
        }

        strategy.recordShot(playerID, shot);

        this.logger.log(
            `{ strategy:${strategy.name}, wins:${this.wins}, losses:${this.losses} ties:${this.ties} }`
        );

        this.inGame = false;
        this.tryToPlayRandomDelay();
    }

    sendMessage(otherPort, method, params) {
        const message = {
            port: this.port,
            playerID: this.id,
            method,
            params,
        };

        const utf8 = JSON.stringify(message);
        const buff = Buffer.from(utf8);

        this.logger.log('send message', method, 'to port', otherPort);
        this.socket.send(buff, otherPort, HOST);
    }

    sampleKnownAddresses() {
        const { knownAddresses } = this;

        return knownAddresses[Math.floor(Math.random() * knownAddresses.length)];
    }

    cancelTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    /**
     * Generate a pseudo-random ID string suitable to be used as a receiverId.
     * @return {string}
     */
    static generateDeviceId() {
        const humanReadable = NAMES[Math.floor(Math.random() * NAMES.length)];

        return `${humanReadable}-${port}`;
    }
}

const player = new Player();

player.initialize();
