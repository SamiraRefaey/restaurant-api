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
function getAllMenuItems(req, res) {
    res.json(menuItems);
}

// GET /api/menu/:id
function getMenuItemById(req, res) {
    const id = Number(req.params.id);
    const menuItem = menuItems.find(item => item.id === id);
    if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
    }
    return res.json(menuItem);
}

// POST /api/menu
function createMenuItem(req, res) {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    const { name, description, price } = body;
    if (
        typeof name !== 'string' ||
        typeof description !== 'string' ||
        typeof price !== 'number' ||
        !Number.isFinite(price) ||
        price <= 0
    ) {
        return res.status(400).json({ error: 'Invalid menu item data' });
    }

    const newMenuItem = {
        id: nextId++,
        name: name.trim(),
        description: description.trim(),
        price
    };
    menuItems.push(newMenuItem);
    return res.status(201).json(newMenuItem);
}

module.exports = {
    getAllMenuItems,
    getMenuItemById,
    createMenuItem
};
