
const menuModel = require("../models/menuModel");
const menuView = require("../views/menuView");

// Temporary in-memory data.
// This stays in the Controller during Increment 1.
let menuItems = [
    {
        id: 1,
        name: "Classic Burger",
        category: "Burgers",
        price: 180,
        available: true
    },
    {
        id: 2,
        name: "Margherita Pizza",
        category: "Pizza",
        price: 220,
        available: true
    },
    {
        id: 3,
        name: "Chicken Sandwich",
        category: "Sandwiches",
        price: 150,
        available: false
    },
    {
        id: 4,
        name: "Caesar Salad",
        category: "Salads",
        price: 130,
        available: true
    }
];

let nextId = 5;

// GET /api/menu
function getAllMenuItems(req, res) {
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
        return res.status(400).json({
            message: "Page and limit must be positive integers"
        });
    }

    const { category: categoryQuery, search: searchQuery } = req.query;
    if (
        (categoryQuery !== undefined && typeof categoryQuery !== "string") ||
        (searchQuery !== undefined && typeof searchQuery !== "string")
    ) {
        return res.status(400).json({
            message: "Category and search must each be a single text value"
        });
    }

    const category = categoryQuery?.trim().toLowerCase();
    const search = searchQuery?.trim().toLowerCase();

    const filteredItems = menuItems.filter(item => {
        const matchesCategory = !category || item.category.toLowerCase() === category;
        const searchableText = `${item.name} ${item.description || ""}`.toLowerCase();
        const matchesSearch = !search || searchableText.includes(search);
        return matchesCategory && matchesSearch;
    });

    const startIndex = (page - 1) * limit;
    const pagedItems = filteredItems.slice(startIndex, startIndex + limit);
    const pagination = {
        page,
        limit,
        total: filteredItems.length,
        totalPages: Math.ceil(filteredItems.length / limit)
    };

    res.json(menuView.presentMenuList(pagedItems, pagination));
}

// GET /api/menu/:id
function getMenuItemById(req, res) {
    if (!menuModel.validateId(req.params.id)) {
        return res.status(400).json({
            message: "ID must be a positive integer"
        });
    }

    const id = Number(req.params.id);
    const item = menuItems.find(item => item.id === id);

    if (!item) {
        return res.status(404).json({
            message: "Menu item not found"
        });
    }

    res.json(menuView.presentMenuItem(item));
}

// POST /api/menu
function createMenuItem(req, res) {
    if (!menuModel.validateMenuItem(req.body)) {
        return res.status(400).json({
            message: "Invalid menu item data"
        });
    }

    const item = {
        id: nextId++,
        ...req.body,
        name: req.body.name.trim(),
        category: req.body.category.trim()
    };

    menuItems.push(item);

    res.status(201).json(menuView.presentMenuItem(item));
}

// PUT /api/menu/:id
function replaceMenuItem(req, res) {
    if (!menuModel.validateId(req.params.id)) {
        return res.status(400).json({
            message: "ID must be a positive integer"
        });
    }

    if (!menuModel.validateMenuItem(req.body)) {
        return res.status(400).json({
            message: "Invalid menu item data"
        });
    }

    const id = Number(req.params.id);
    const index = menuItems.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Menu item not found"
        });
    }

    menuItems[index] = {
        id,
        ...req.body,
        name: req.body.name.trim(),
        category: req.body.category.trim()
    };

    res.json(menuView.presentMenuItem(menuItems[index]));
}

// PATCH /api/menu/:id
function updateMenuItem(req, res) {
    if (!menuModel.validateId(req.params.id)) {
        return res.status(400).json({
            message: "ID must be a positive integer"
        });
    }

    if (!menuModel.validateMenuItemPatch(req.body)) {
        return res.status(400).json({
            message: "Invalid update data"
        });
    }

    const id = Number(req.params.id);
    const index = menuItems.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Menu item not found"
        });
    }

    const updatedItem = {
        ...menuItems[index],
        ...req.body
    };

    if (!menuModel.validateMenuItem(updatedItem)) {
        return res.status(400).json({
            message: "Invalid menu item data"
        });
    }

    menuItems[index] = {
        ...updatedItem,
        name: updatedItem.name.trim(),
        category: updatedItem.category.trim()
    };

    res.json(menuView.presentMenuItem(menuItems[index]));
}

// DELETE /api/menu/:id
function deleteMenuItem(req, res) {
    if (!menuModel.validateId(req.params.id)) {
        return res.status(400).json({
            message: "ID must be a positive integer"
        });
    }

    const id = Number(req.params.id);
    const index = menuItems.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Menu item not found"
        });
    }

    menuItems.splice(index, 1);

    res.status(204).send();
}

module.exports = {
    getAllMenuItems,
    getMenuItemById,
    createMenuItem,
    replaceMenuItem,
    updateMenuItem,
    deleteMenuItem
};
