const assert = require('node:assert/strict');
const test = require('node:test');
const DatabaseConnection = require('../database/DatabaseConnection');
const menuRepository = require('../repositories/menuRepository');
const menuService = require('../services/menuService');

test('database connection returns one shared pool instance', async () => {
    const first = DatabaseConnection.getInstance();
    const second = DatabaseConnection.getInstance();

    assert.strictEqual(first, second);
    await first.end();
});

test('menu service selects each supported search strategy', async () => {
    const originalGetMenuItems = menuRepository.getMenuItems;
    const capturedQueries = [];
    menuRepository.getMenuItems = async query => {
        capturedQueries.push(query);
        return { data: [], total: 0 };
    };

    try {
        for (const searchBy of ['all', 'name', 'description']) {
            const result = await menuService.getAllMenuItems({ search: 'pizza', search_by: searchBy });
            assert.deepEqual(result.data, []);
        }

        assert.match(capturedQueries[0].searchStrategy.buildCondition(1), /name.*OR.*description/);
        assert.equal(capturedQueries[1].searchStrategy.buildCondition(1), 'LOWER(name) LIKE $1');
        assert.equal(
            capturedQueries[2].searchStrategy.buildCondition(1),
            "LOWER(COALESCE(description, '')) LIKE $1"
        );
    } finally {
        menuRepository.getMenuItems = originalGetMenuItems;
    }
});

test('menu service rejects unknown search strategy names', async () => {
    const result = await menuService.getAllMenuItems({ search: 'pizza', search_by: 'price' });
    assert.equal(result.status, 400);
    assert.equal(result.error, 'search_by must be all, name, or description');
});