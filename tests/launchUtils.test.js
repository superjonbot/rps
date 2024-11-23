const { loopStrategy } = require('../utils/launchUtils');

describe('launchUtils', () => {
    describe('loopStrategy', () => {
        it('should return the correct strategy pattern based on the index', () => {
            const strategyPattern = ['constant', 'random', 'custom'];
            expect(loopStrategy(0, strategyPattern)).toBe('constant');
            expect(loopStrategy(1, strategyPattern)).toBe('random');
            expect(loopStrategy(2, strategyPattern)).toBe('custom');
            expect(loopStrategy(3, strategyPattern)).toBe('constant');
            expect(loopStrategy(4, strategyPattern)).toBe('random');
        });
    });
});
