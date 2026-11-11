class NameSearchStrategy {
    buildCondition(parameterIndex) {
        return `LOWER(name) LIKE $${parameterIndex}`;
    }
}

class DescriptionSearchStrategy {
    buildCondition(parameterIndex) {
        return `LOWER(COALESCE(description, '')) LIKE $${parameterIndex}`;
    }
}

class CombinedSearchStrategy {
    buildCondition(parameterIndex) {
        return `(LOWER(name) LIKE $${parameterIndex} OR LOWER(COALESCE(description, '')) LIKE $${parameterIndex})`;
    }
}

module.exports = { NameSearchStrategy, DescriptionSearchStrategy, CombinedSearchStrategy };