const {
    NameSearchStrategy,
    DescriptionSearchStrategy,
    CombinedSearchStrategy
} = require('../strategies/MenuSearchStrategies');

const strategies = {
    all: CombinedSearchStrategy,
    name: NameSearchStrategy,
    description: DescriptionSearchStrategy
};

class MenuSearchStrategyFactory {
    static supports(strategyName) {
        return Object.hasOwn(strategies, strategyName);
    }

    static create(strategyName = 'all') {
        const Strategy = strategies[strategyName];
        if (!Strategy) throw new RangeError(`Unsupported menu search strategy: ${strategyName}`);
        return new Strategy();
    }
}

module.exports = MenuSearchStrategyFactory;