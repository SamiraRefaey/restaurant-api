const menuModel = require('../models/menuModel');
const menuRepository = require('../repositories/menuRepository');
const MenuSearchStrategyFactory = require('../factories/MenuSearchStrategyFactory');

function failure(status, error) {
    return { status, error };
}

// Previously category filtering compared free-text names in memory. The supplied
// schema uses category IDs and restaurant ownership, so those filters use IDs.
async function getAllMenuItems(query = {}) {
    const page = query.page === undefined ? 1 : Number(query.page);
    const limit = query.limit === undefined ? 10 : Number(query.limit);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
        return failure(400, 'Page and limit must be positive integers');
    }
    if ((query.category_id !== undefined && !menuModel.validateId(query.category_id)) ||
        (query.restaurant_id !== undefined && !menuModel.validateId(query.restaurant_id)) ||
        (query.search !== undefined && typeof query.search !== 'string')) {
        return failure(400, 'Category ID, restaurant ID, and search must be valid single values');
    }
    if (query.search_by !== undefined && !MenuSearchStrategyFactory.supports(query.search_by)) {
        return failure(400, 'search_by must be all, name, or description');
    }

    const result = await menuRepository.getMenuItems({
        categoryId: query.category_id === undefined ? undefined : Number(query.category_id),
        restaurantId: query.restaurant_id === undefined ? undefined : Number(query.restaurant_id),
        search: query.search?.trim().toLowerCase(),
        searchStrategy: MenuSearchStrategyFactory.create(query.search_by),
        limit,
        offset: (page - 1) * limit
    });
    return {
        data: result.data,
        pagination: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) }
    };
}

// Previously this returned the repository's in-memory lookup immediately. The
// database query must be awaited before deciding whether the row exists.
async function getMenuItemById(rawId) {
    if (!menuModel.validateId(rawId)) return failure(400, 'ID must be a positive integer');
    const item = await menuRepository.getMenuItemById(Number(rawId));
    return item ? { data: item } : failure(404, 'Menu item not found');
}

// Previously creation was synchronous; PostgreSQL assigns the ID and returns
// the stored row asynchronously.
async function createMenuItem(data) {
    if (!menuModel.validateMenuItem(data)) return failure(400, 'Invalid menu item data');
    return { data: await menuRepository.createMenuItem(data) };
}

// Previously replacement modified an array entry using the old item field names.
async function replaceMenuItem(rawId, data) {
    if (!menuModel.validateId(rawId)) return failure(400, 'ID must be a positive integer');
    if (!menuModel.validateMenuItem(data)) return failure(400, 'Invalid menu item data');
    const item = await menuRepository.replaceMenuItem(Number(rawId), data);
    return item ? { data: item } : failure(404, 'Menu item not found');
}

// Previously patching used the old item fields and read from memory. Merge the
// schema-shaped record and await both database operations.
async function updateMenuItem(rawId, data) {
    if (!menuModel.validateId(rawId)) return failure(400, 'ID must be a positive integer');
    if (!menuModel.validateMenuItemPatch(data)) return failure(400, 'Invalid update data');
    const id = Number(rawId);
    const currentItem = await menuRepository.getMenuItemById(id);
    if (!currentItem) return failure(404, 'Menu item not found');
    const updatedItem = { ...currentItem, ...data };
    delete updatedItem.item_id;
    if (!menuModel.validateMenuItem(updatedItem)) return failure(400, 'Invalid update data');
    return { data: await menuRepository.updateMenuItem(id, data) };
}

// Previously deletion removed the array entry. The supplied schema should keep
// referenced menu history, so the repository marks the item unavailable.
async function deleteMenuItem(rawId) {
    if (!menuModel.validateId(rawId)) return failure(400, 'ID must be a positive integer');
    const item = await menuRepository.removeMenuItem(Number(rawId));
    return item ? { data: item } : failure(404, 'Menu item not found');
}

module.exports = { getAllMenuItems, getMenuItemById, createMenuItem, replaceMenuItem, updateMenuItem, deleteMenuItem };
