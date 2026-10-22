const menuModel = require('../models/menuModel');
const menuRepository = require('../repositories/menuRepository');

//Retrieve , search, filter and paginate menu items
function getAllMenuItems(query) {
    let items= menuRepository.getMenuItems();

    const page = query.page === undefined ? 1 : Number(query.page);
    const limit = query.limit === undefined ? 10 : Number(query.limit);

    if (query.category !== undefined) {
        if (typeof query.category !== "string") {
            return { error: "Category must be a single text value" };
        }
        const category = query.category.trim().toLowerCase();
        items = items.filter(item => item.category.toLowerCase() === category);
    }
    if (query.search !== undefined) {
        if (typeof query.search !== "string") {
            return { error: "Search must be a single text value" };
        }
        const search = query.search.trim().toLowerCase();
        items = items.filter(item => item.name.toLowerCase().includes(search));
    }

    // Implement pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    items = items.slice(startIndex, endIndex);

    return items;
}