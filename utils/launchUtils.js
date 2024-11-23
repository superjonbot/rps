//Launch Utils

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// loads the environment variables from the file
const loadEnvVariables = envFilePath => {
    const envFileContent = fs.readFileSync(envFilePath, 'utf-8');
    return envFileContent.split('\n').reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) {
            acc[key.trim()] = value.trim();
        }
        return acc;
    }, {});
};

// opens a new terminal window and runs a specified command
const openTerminal = (command, debug = false) => {
    const fullCommand = `cd ${process.cwd()} && ${command}`;
    if (debug) {
        console.log(`[Debug] ${fullCommand}`);
    } else {
        exec(`osascript -e 'tell application "Terminal" to do script "${fullCommand}"'`);
    }
};

// validates that variables are set and are valid numbers
const validateEnvVariables = (envVariables, requiredVars) => {
    requiredVars.forEach(varName => {
        if (isNaN(parseInt(envVariables[varName], 10))) {
            console.error(`${varName} is not set or invalid in the environment file`);
            process.exit(1);
        }
    });
};

// loops through the strategy pattern
const loopStrategy = (i, strategyPattern) => {
    return strategyPattern[i % strategyPattern.length];
};

module.exports = {
    loopStrategy,
    loadEnvVariables,
    openTerminal,
    validateEnvVariables,
};
