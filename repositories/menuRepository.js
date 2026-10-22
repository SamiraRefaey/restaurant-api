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

function getMenuItems() {
    return menuItems.map(item => ({ ...item }));
}

function getMenuItemById(id) {
    const item = menuItems.find(item => item.id === id);
    return item ? { ...item } : null;
}

function createMenuItem(data) {
    const item = {
        id: nextId++,
        ...data,
        name: data.name.trim(),
        category: data.category.trim()
    };
    menuItems.push(item);
    return { ...item };
}

function updateMenuItem(id, data) {
    const index = menuItems.findIndex(item => item.id === id);
    if (index !== -1) {
        menuItems[index] = {
            id,
            ...data,
            name: data.name.trim(),
            category: data.category.trim()
        };
        return { ...menuItems[index] };
    }
    return null;
}
function replaceMenuItem(id, data) {
    const index = menuItems.findIndex(item => item.id === id);
    if (index !== -1) {
        menuItems[index] = {
            id,
            ...data,
            name: data.name.trim(),
            category: data.category.trim()
        };
        return { ...menuItems[index] };
    }
    return null;
}
    
function removeMenuItem(id) {
    const index = menuItems.findIndex(item => item.id === id);
    if (index !== -1) {
        const removedItem = menuItems.splice(index, 1)[0];
        return { ...removedItem };
    }
    return false;
}
module.exports = {
    getMenuItems,
    getMenuItemById,    
    createMenuItem,
    updateMenuItem,
    replaceMenuItem,
    removeMenuItem
};
 