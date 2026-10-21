function presentMenuItem(menuItem) {
return {
    id: menuItem.id,
    name: menuItem.name,
    category: menuItem.category,
    price: menuItem.price,
    available: menuItem.available
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