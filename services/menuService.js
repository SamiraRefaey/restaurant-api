const menuModel = require("../models/menuModel");
const menuRepository = require("../repositories/menuRepository");

function failure(status, error) {
    return { status, error };
}

// Retrieve, filter, search, and paginate menu items.
function getAllMenuItems(query = {}) {
    const page = query.page === undefined ? 1 : Number(query.page);
    const limit = query.limit === undefined ? 10 : Number(query.limit);

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
        return failure(400, "Page and limit must be positive integers");
    }

    if (
        (query.category !== undefined && typeof query.category !== "string") ||
        (query.search !== undefined && typeof query.search !== "string")
    ) {
        return failure(400, "Category and search must each be a single text value");
    }

    const category = query.category?.trim().toLowerCase();
    const search = query.search?.trim().toLowerCase();
    const filteredItems = menuRepository.getMenuItems().filter(item => {
        const matchesCategory = !category || item.category.toLowerCase() === category;
        const searchableText = `${item.name} ${item.description || ""}`.toLowerCase();
        const matchesSearch = !search || searchableText.includes(search);
        return matchesCategory && matchesSearch;
    });

    const startIndex = (page - 1) * limit;
    return {
        data: filteredItems.slice(startIndex, startIndex + limit),
        pagination: {
            page,
            limit,
            total: filteredItems.length,
            totalPages: Math.ceil(filteredItems.length / limit)
        }
    };
}

function getMenuItemById(rawId) {
    if (!menuModel.validateId(rawId)) {
        return failure(400, "ID must be a positive integer");
    }

    const item = menuRepository.getMenuItemById(Number(rawId));
    return item ? { data: item } : failure(404, "Menu item not found");
}

function createMenuItem(data) {
    if (!menuModel.validateMenuItem(data)) {
        return failure(400, "Invalid menu item data");
    }

    return { data: menuRepository.createMenuItem(data) };
}

function replaceMenuItem(rawId, data) {
    if (!menuModel.validateId(rawId)) {
        return failure(400, "ID must be a positive integer");
    }
    if (!menuModel.validateMenuItem(data)) {
        return failure(400, "Invalid menu item data");
    }

    const item = menuRepository.replaceMenuItem(Number(rawId), data);
    return item ? { data: item } : failure(404, "Menu item not found");
}

function updateMenuItem(rawId, data) {
    if (!menuModel.validateId(rawId)) {
        return failure(400, "ID must be a positive integer");
    }
    if (!menuModel.validateMenuItemPatch(data)) {
        return failure(400, "Invalid update data");
    }

    const id = Number(rawId);
    const currentItem = menuRepository.getMenuItemById(id);
    if (!currentItem) {
        return failure(404, "Menu item not found");
    }

    const updatedItem = { ...currentItem, ...data };
    // The model validates editable fields only; `id` belongs to the repository.
    delete updatedItem.id;
    if (!menuModel.validateMenuItem(updatedItem)) {
        return failure(400, "Invalid update data");
    }

    return { data: menuRepository.updateMenuItem(id, updatedItem) };
}

function deleteMenuItem(rawId) {
    if (!menuModel.validateId(rawId)) {
        return failure(400, "ID must be a positive integer");
    }

    const removedItem = menuRepository.removeMenuItem(Number(rawId));
    return removedItem ? { data: removedItem } : failure(404, "Menu item not found");
}

module.exports = {
    getAllMenuItems,
    getMenuItemById,
    createMenuItem,
    replaceMenuItem,
    updateMenuItem,
    deleteMenuItem
};
