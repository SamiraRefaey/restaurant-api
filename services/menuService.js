const menuModel = require('../models/menuModel');
const menuRepository = require('../repositories/menuRepository');
const MenuSearchStrategyFactory = require('../factories/MenuSearchStrategyFactory');
const AppError = require('../errors/AppError');

// Previously category filtering compared free-text names in memory. The supplied
// schema uses category IDs and restaurant ownership, so those filters use IDs.
async function getAllMenuItems(query = {}) {
    const page = query.page === undefined ? 1 : Number(query.page);
    const limit = query.limit === undefined ? 10 : Number(query.limit);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
        throw new AppError('Page and limit must be positive integers', 400);
    }
    if ((query.category_id !== undefined && !menuModel.validateId(query.category_id)) ||
        (query.restaurant_id !== undefined && !menuModel.validateId(query.restaurant_id)) ||
        (query.search !== undefined && typeof query.search !== 'string')) {
        throw new AppError('Category ID, restaurant ID, and search must be valid single values', 400);
    }
    if (query.search_by !== undefined && !MenuSearchStrategyFactory.supports(query.search_by)) {
        throw new AppError('search_by must be all, name, or description', 400);
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
    if (!menuModel.validateId(rawId)) throw new AppError('ID must be a positive integer', 400);
    const item = await menuRepository.getMenuItemById(Number(rawId));
    if (!item) throw new AppError('Menu item not found', 404);
    return { data: item };
}

// Previously creation was synchronous; PostgreSQL assigns the ID and returns
// the stored row asynchronously.
async function createMenuItem(data) {
    if (!menuModel.validateMenuItem(data)) throw new AppError('Invalid menu item data', 400);
    return { data: await menuRepository.createMenuItem(data) };
}

// Previously replacement modified an array entry using the old item field names.
async function replaceMenuItem(rawId, data) {
    if (!menuModel.validateId(rawId)) throw new AppError('ID must be a positive integer', 400);
    if (!menuModel.validateMenuItem(data)) throw new AppError('Invalid menu item data', 400);
    const item = await menuRepository.replaceMenuItem(Number(rawId), data);
    if (!item) throw new AppError('Menu item not found', 404);
    return { data: item };
}

// Previously patching used the old item fields and read from memory. Merge the
// schema-shaped record and await both database operations.
async function updateMenuItem(rawId, data) {
    if (!menuModel.validateId(rawId)) throw new AppError('ID must be a positive integer', 400);
    if (!menuModel.validateMenuItemPatch(data)) throw new AppError('Invalid update data', 400);
    const id = Number(rawId);
    const currentItem = await menuRepository.getMenuItemById(id);
    if (!currentItem) throw new AppError('Menu item not found', 404);
    const updatedItem = { ...currentItem, ...data };
    delete updatedItem.item_id;
    if (!menuModel.validateMenuItem(updatedItem)) throw new AppError('Invalid update data', 400);
    return { data: await menuRepository.updateMenuItem(id, data) };
}

// Previously deletion removed the array entry. The supplied schema should keep
// referenced menu history, so the repository marks the item unavailable.
async function deleteMenuItem(rawId) {
    if (!menuModel.validateId(rawId)) throw new AppError('ID must be a positive integer', 400);
    const item = await menuRepository.removeMenuItem(Number(rawId));
    if (!item) throw new AppError('Menu item not found', 404);
    return { data: item };
}

module.exports = { getAllMenuItems, getMenuItemById, createMenuItem, replaceMenuItem, updateMenuItem, deleteMenuItem };
