let menuItems = [
    {
        id: 1,
        name: 'Cheeseburger',
        category: 'Burgers',
        description: 'A juicy beef patty with melted cheese, lettuce, tomato, and our special sauce.',
        price: 8.99
    },
    {
        id: 2,
        name: 'Margherita Pizza',
        category: 'Pizza',
        description: 'Classic pizza with fresh mozzarella, tomatoes, and basil.',
        price: 12.99
    },
    {
        id: 3,
        name: 'California Roll',
        category: 'Sushi',
        description: 'A sushi roll with crab, avocado, and cucumber.',
        price: 9.99
    },
    {
        id: 4,
        name: 'Caesar Salad',
        category: 'Salads',
        description: 'Crisp romaine lettuce with Caesar dressing, croutons, and Parmesan cheese.',
        price: 7.99
    }
];
let nextId = 5;

// Test in Postman: GET http://localhost:3000/api/menu?category=Pizza&search=cheese&page=1&limit=5
// GET /api/menu
// Filter, search, and paginate menu items.
function getAllMenuItems(req, res) {
    // Read page and limit from the URL; use defaults when they are omitted.
    const page = parsePaginationValue(req.query.page, 1);
    const limit = parsePaginationValue(req.query.limit, 10);

    // Reject invalid pagination values before calculating the result page.
    if (page === null || limit === null) {
        return res.status(400).json({ error: 'Page and limit must be positive integers' });
    }

    // Normalize filter and search text so matching is case-insensitive.
    const category = typeof req.query.category === 'string' ? req.query.category.trim().toLowerCase() : '';
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    let filteredItems = menuItems;

    // Keep only items in the requested category.
    if (category) {
        filteredItems = filteredItems.filter(item => item.category.toLowerCase() === category);
    }

    // Search for the query anywhere in an item's name or description.
    if (search) {
        filteredItems = filteredItems.filter(item =>
            item.name.toLowerCase().includes(search) || item.description.toLowerCase().includes(search)
        );
    }

    // Count after filtering, then select only the items for the requested page.
    const total = filteredItems.length;
    const startIndex = (page - 1) * limit;
    return res.json({
        data: filteredItems.slice(startIndex, startIndex + limit),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });
}

// Test in Postman: GET http://localhost:3000/api/menu/1
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

// Test in Postman: POST http://localhost:3000/api/menu (Body > raw > JSON):
// { "name": "BBQ Chicken Pizza", "category": "Pizza", "description": "Chicken and cheese", "price": 250 }
// POST /api/menu
// Validate the submitted item, assign it a new ID, and return it with status 201.
function createMenuItem(req, res) {
    const validationError = validateMenuItem(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const { name, category, description, price } = req.body;

    const newMenuItem = {
        id: nextId++,
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        price
    };
    menuItems.push(newMenuItem);
    return res.status(201).json(newMenuItem);
}

// Test in Postman: PUT http://localhost:3000/api/menu/1 (send all editable fields as JSON).
// PUT /api/menu/:id
// Replace all editable fields for an existing item.
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

    const { name, category, description, price } = req.body;
    menuItem.name = name.trim();
    menuItem.category = category.trim();
    menuItem.description = description.trim();
    menuItem.price = price;
    return res.json(menuItem);
}

// Test in Postman: PATCH http://localhost:3000/api/menu/1 (Body > raw > JSON):
// { "price": 275 }
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
    const allowedFields = ['name', 'category', 'description', 'price'];
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    const fields = Object.keys(body);
    if (fields.length === 0 || fields.some(field => !allowedFields.includes(field))) {
        return res.status(400).json({ error: 'Provide at least one valid field: name, category, description, or price' });
    }

    if ('name' in body && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
        return res.status(400).json({ error: 'Name must be a non-empty string' });
    }
    if ('description' in body && (typeof body.description !== 'string' || body.description.trim().length === 0)) {
        return res.status(400).json({ error: 'Description must be a non-empty string' });
    }
    if ('category' in body && (typeof body.category !== 'string' || body.category.trim().length === 0)) {
        return res.status(400).json({ error: 'Category must be a non-empty string' });
    }
    if ('price' in body && (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price <= 0)) {
        return res.status(400).json({ error: 'Price must be a positive number' });
    }

    if ('name' in body) menuItem.name = body.name.trim();
    if ('category' in body) menuItem.category = body.category.trim();
    if ('description' in body) menuItem.description = body.description.trim();
    if ('price' in body) menuItem.price = body.price;

    return res.json(menuItem);
}

// Test in Postman: DELETE http://localhost:3000/api/menu/1 (no request body).
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

// Check that a request body contains non-empty text fields and a positive price.
// Return an error message when invalid, or null when valid.
function validateMenuItem(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return 'Invalid request body';
    }

    const { name, category, description, price } = body;
    if (
        typeof name !== 'string' || name.trim().length === 0 ||
        typeof category !== 'string' || category.trim().length === 0 ||
        typeof description !== 'string' || description.trim().length === 0 ||
        typeof price !== 'number' || !Number.isFinite(price) || price <= 0
    ) {
        return 'Invalid menu item data';
    }
    return null;
}

// Parse a page or limit query value. Use the default if omitted, or return null
// when the supplied value is not a positive, safe integer.
function parsePaginationValue(value, defaultValue) {
    if (value === undefined) return defaultValue;
    if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

module.exports = {
    getAllMenuItems,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    patchMenuItem,
    deleteMenuItem
};
