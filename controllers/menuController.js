let menuItems = [
    {
        id: 1,
        name: 'Cheeseburger',
        description: 'A juicy beef patty with melted cheese, lettuce, tomato, and our special sauce.',
        price: 8.99
    },
    {
        id: 2,
        name: 'Margherita Pizza',
        description: 'Classic pizza with fresh mozzarella, tomatoes, and basil.',
        price: 12.99
    },
    {
        id: 3,
        name: 'California Roll',
        description: 'A sushi roll with crab, avocado, and cucumber.',
        price: 9.99
    },
    {
        id: 4,
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce with Caesar dressing, croutons, and Parmesan cheese.',
        price: 7.99
    }
];
let nextId = 5;

// GET /api/menu
// Return every menu item.
function getAllMenuItems(req, res) {
    res.json(menuItems);
}

// GET /api/menu/:id
// Return one menu item by ID, or 404 if it does not exist.
function getMenuItemById(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid menu item ID' });
    }
    const menuItem = menuItems.find(item => item.id === id);
    if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
    }
    return res.json(menuItem);
}

// POST /api/menu
// Validate the submitted item, assign it a new ID, and return it with status 201.
function createMenuItem(req, res) {
    const validationError = validateMenuItem(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const { name, description, price } = req.body;

    const newMenuItem = {
        id: nextId++,
        name: name.trim(),
        description: description.trim(),
        price
    };
    menuItems.push(newMenuItem);
    return res.status(201).json(newMenuItem);
}

// PUT /api/menu/:id
// Replace all editable fields (name, description, and price) for an existing item.
function updateMenuItem(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid menu item ID' });
    }

    const menuItem = menuItems.find(item => item.id === id);
    if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
    }

    const validationError = validateMenuItem(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const { name, description, price } = req.body;
    menuItem.name = name.trim();
    menuItem.description = description.trim();
    menuItem.price = price;
    return res.json(menuItem);
}

// PATCH /api/menu/:id
// Update only the editable fields provided in the request body.
function patchMenuItem(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid menu item ID' });
    }

    const menuItem = menuItems.find(item => item.id === id);
    if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
    }

    const body = req.body;
    const allowedFields = ['name', 'description', 'price'];
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    const fields = Object.keys(body);
    if (fields.length === 0 || fields.some(field => !allowedFields.includes(field))) {
        return res.status(400).json({ error: 'Provide at least one valid field: name, description, or price' });
    }

    if ('name' in body && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
        return res.status(400).json({ error: 'Name must be a non-empty string' });
    }
    if ('description' in body && (typeof body.description !== 'string' || body.description.trim().length === 0)) {
        return res.status(400).json({ error: 'Description must be a non-empty string' });
    }
    if ('price' in body && (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price <= 0)) {
        return res.status(400).json({ error: 'Price must be a positive number' });
    }

    if ('name' in body) menuItem.name = body.name.trim();
    if ('description' in body) menuItem.description = body.description.trim();
    if ('price' in body) menuItem.price = body.price;

    return res.json(menuItem);
}

// DELETE /api/menu/:id
// Remove an existing item. A successful deletion returns 204 with no response body.
function deleteMenuItem(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid menu item ID' });
    }

    const menuItemIndex = menuItems.findIndex(item => item.id === id);
    if (menuItemIndex === -1) {
        return res.status(404).json({ error: 'Menu item not found' });
    }

    menuItems.splice(menuItemIndex, 1);
    return res.status(204).send();
}

// Check that a request body contains a non-empty name and description and a positive price.
// Return an error message when invalid, or null when valid.
function validateMenuItem(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return 'Invalid request body';
    }

    const { name, description, price } = body;
    if (
        typeof name !== 'string' || name.trim().length === 0 ||
        typeof description !== 'string' || description.trim().length === 0 ||
        typeof price !== 'number' || !Number.isFinite(price) || price <= 0
    ) {
        return 'Invalid menu item data';
    }
    return null;
}

module.exports = {
    getAllMenuItems,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    patchMenuItem,
    deleteMenuItem
};
