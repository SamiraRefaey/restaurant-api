
const menuService = require("../services/menuService");
const menuView = require("../views/menuView");

// Send a simple error response returned by the Service.
function sendError(res, result) {
    return res.status(result.status).json({
        message: result.error
    });
}

// GET /api/menu
// Previously handlers called synchronous service functions; database-backed
// service calls return Promises, so handlers are async and await each result.
async function getAllMenuItems(req, res) {
    const result = await menuService.getAllMenuItems(req.query);

    if (result.error) {
        return sendError(res, result);
    }

    res.json(
        menuView.presentMenuList(result.data, result.pagination)
    );
}

// GET /api/menu/:id
// Previously this lookup returned immediately from memory; await the DB query.
async function getMenuItemById(req, res) {
    const result = await menuService.getMenuItemById(req.params.id);

    if (result.error) {
        return sendError(res, result);
    }

    res.json(menuView.presentMenuItem(result.data));
}

// POST /api/menu
// Previously createMenuItem returned synchronously; PostgreSQL INSERT is async.
async function createMenuItem(req, res) {
    const result = await menuService.createMenuItem(req.body);

    if (result.error) {
        return sendError(res, result);
    }

    res.status(201).json(
        menuView.presentMenuItem(result.data)
    );
}

// PUT /api/menu/:id
// Previously replacement updated an array immediately; await the DB UPDATE.
async function replaceMenuItem(req, res) {
    const result = await menuService.replaceMenuItem(
        req.params.id,
        req.body
    );

    if (result.error) {
        return sendError(res, result);
    }

    res.json(menuView.presentMenuItem(result.data));
}

// PATCH /api/menu/:id
// Previously patching used synchronous in-memory reads and updates; await both.
async function updateMenuItem(req, res) {
    const result = await menuService.updateMenuItem(
        req.params.id,
        req.body
    );

    if (result.error) {
        return sendError(res, result);
    }

    res.json(menuView.presentMenuItem(result.data));
}

// DELETE /api/menu/:id
// Previously deletion spliced the in-memory array; await the persistent DELETE.
async function deleteMenuItem(req, res) {
    const result = await menuService.deleteMenuItem(req.params.id);

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
