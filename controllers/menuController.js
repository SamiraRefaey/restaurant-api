
const menuService = require("../services/menuService");
const menuView = require("../views/menuView");

// Send a simple error response returned by the Service.
function sendError(res, result) {
    return res.status(result.status).json({
        message: result.error
    });
}

// GET /api/menu
function getAllMenuItems(req, res) {
    const result = menuService.getAllMenuItems(req.query);

    if (result.error) {
        return sendError(res, result);
    }

    res.json(
        menuView.presentMenuList(result.data, result.pagination)
    );
}

// GET /api/menu/:id
function getMenuItemById(req, res) {
    const result = menuService.getMenuItemById(req.params.id);

    if (result.error) {
        return sendError(res, result);
    }

    res.json(menuView.presentMenuItem(result.data));
}

// POST /api/menu
function createMenuItem(req, res) {
    const result = menuService.createMenuItem(req.body);

    if (result.error) {
        return sendError(res, result);
    }

    res.status(201).json(
        menuView.presentMenuItem(result.data)
    );
}

// PUT /api/menu/:id
function replaceMenuItem(req, res) {
    const result = menuService.replaceMenuItem(
        req.params.id,
        req.body
    );

    if (result.error) {
        return sendError(res, result);
    }

    res.json(menuView.presentMenuItem(result.data));
}

// PATCH /api/menu/:id
function updateMenuItem(req, res) {
    const result = menuService.updateMenuItem(
        req.params.id,
        req.body
    );

    if (result.error) {
        return sendError(res, result);
    }

    res.json(menuView.presentMenuItem(result.data));
}

// DELETE /api/menu/:id
function deleteMenuItem(req, res) {
    const result = menuService.deleteMenuItem(req.params.id);

    if (result.error) {
        return sendError(res, result);
    }

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
