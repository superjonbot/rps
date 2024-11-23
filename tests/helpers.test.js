const { mergeObjects, omitEntry, convertAndSortByValue, getObjectsWithSameValue, pickRandomEntry, mostOccurringValue } = require('../utils/helpers');

describe('mergeObjects', () => {
    test('should merge two objects and keep the higher value', () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { b: 1, c: 4 };
        const result = mergeObjects(obj1, obj2);
        expect(result).toEqual({ a: 1, b: 2, c: 4 });
    });

    test('should merge two objects and keep the value from the first object if it is higher', () => {
        const obj1 = { a: 5, b: 3 };
        const obj2 = { a: 2, b: 4 };
        const result = mergeObjects(obj1, obj2);
        expect(result).toEqual({ a: 5, b: 4 });
    });
});

describe('omitEntry', () => {
    test('should omit the specified entry from the object', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = omitEntry(obj, 'b');
        expect(result).toEqual({ a: 1, c: 3 });
    });

    test('should return the same object if the key to omit does not exist', () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = omitEntry(obj, 'd');
        expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });
});

describe('convertAndSortByValue', () => {
    test('should convert object to array and sort by value in ascending order', () => {
        const obj = { a: 3, b: 1, c: 2 };
        const result = convertAndSortByValue(obj);
        expect(result).toEqual([['b', 1], ['c', 2], ['a', 3]]);
    });

    test('should convert object to array and sort by value in descending order', () => {
        const obj = { a: 3, b: 1, c: 2 };
        const result = convertAndSortByValue(obj, true);
        expect(result).toEqual([['a', 3], ['c', 2], ['b', 1]]);
    });
});

describe('getObjectsWithSameValue', () => {
    test('should return objects with the same value as the first object', () => {
        const array = [['a', 1], ['b', 1], ['c', 2]];
        const result = getObjectsWithSameValue(array);
        expect(result).toEqual([['a', 1], ['b', 1]]);
    });

    test('should return an empty array if the input array is empty', () => {
        const array = [];
        const result = getObjectsWithSameValue(array);
        expect(result).toEqual([]);
    });
});

describe('pickRandomEntry', () => {
    test('should return a random entry from the array', () => {
        const array = [['a', 1], ['b', 2], ['c', 3]];
        const result = pickRandomEntry(array);
        expect(array).toContainEqual(result);
    });

    test('should return undefined if the array is empty', () => {
        const array = [];
        const result = pickRandomEntry(array);
        expect(result).toBeUndefined();
    });
});

describe('mostOccurringValue', () => {
  test('should return the most occurring value in the array', () => {
      const array = ['a', 'b', 'a', 'c', 'a', 'b'];
      const result = mostOccurringValue(array);
      expect(result).toBe('a');
  });

  test('should return "equal" if there is a tie', () => {
      const array = ['a', 'b', 'a', 'b', 'c'];
      const result = mostOccurringValue(array);
      expect(result).toBe('equal');
  });

  test('should return null if the array is empty', () => {
      const array = [];
      const result = mostOccurringValue(array);
      expect(result).toBeNull();
  });
});
