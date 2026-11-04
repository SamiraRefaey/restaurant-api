// Previously responses exposed the demo fields id/category/price/available.
// Keep the database schema's item, restaurant, category, and pricing names.
function presentMenuItem(menuItem) {
    return {
        item_id: menuItem.item_id,
        restaurant_id: menuItem.restaurant_id,
        category_id: menuItem.category_id,
        name: menuItem.name,
        description: menuItem.description,
        base_price: menuItem.base_price,
        image_url: menuItem.image_url,
        is_available: menuItem.is_available
    };

}

function presentMenuList(items,pagination) {
    return{
        data: items.map(presentMenuItem),
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: pagination.totalPages
        }  
    };
}
module.exports = {
    presentMenuItem,
    presentMenuList
};
