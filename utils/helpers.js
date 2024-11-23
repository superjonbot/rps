//Helper Utils

// this merges two objects, keeping the highest value for each key
const mergeObjects = (obj1, obj2) => {
    const result = { ...obj1 };
    for (const key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            if (!result.hasOwnProperty(key) || obj2[key] >= result[key]) {
                result[key] = obj2[key];
            }
        }
    }

    return result;
};

// this removes a key from an object
const omitEntry = (obj, keyToOmit) => {
    const entries = Object.entries(obj);
    const filteredEntries = entries.filter(([key]) => key !== keyToOmit);

    return Object.fromEntries(filteredEntries);
};

// this converts an object to an array and sorts it by the value
const convertAndSortByValue = (obj, reverse = false) => {
    const entries = Object.entries(obj);
    entries.sort((a, b) => a[1] - b[1]);

    return reverse ? entries.reverse() : entries;
};

// returns array of objects with same value as the first
const getObjectsWithSameValue = array => {
    if (array.length === 0) return [];
    const targetValue = array[0][1];

    return array.filter(item => item[1] === targetValue);
};

// picks a random entry from an array
const pickRandomEntry = array => {
    if (array.length === 0) return undefined;
    const randomIndex = Math.floor(Math.random() * array.length);

    return array[randomIndex];
};

const mostOccurringValue = array => {
    const counts = {};

    // Count occurrences of each value
    array.forEach(v => {
        counts[v] = (counts[v] || 0) + 1;
    });

    let maxCount = 0;
    let mostOccurring = null;
    let tie = false;

    // Determine the most occurring value
    for (const v in counts) {
        if (counts[v] > maxCount) {
            maxCount = counts[v];
            mostOccurring = v;
            tie = false;
        } else if (counts[v] === maxCount) {
            tie = true;
        }
    }

    return tie ? 'equal' : mostOccurring;
};

module.exports = {
    mergeObjects,
    omitEntry,
    convertAndSortByValue,
    getObjectsWithSameValue,
    pickRandomEntry,
    mostOccurringValue,
};
