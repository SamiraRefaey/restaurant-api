let menuItems= [
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
    },{
    id: 4,
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with Caesar dressing, croutons, and Parmesan cheese.',
    price: 7.99
  }

]
let nextId = 5; // Next ID to assign for new menu items
//GET/api/menu
function getAllMenuItems(req, res) {
    res.json(menuItems);
}
//Get/api/menu/:id
function getMenuItemById(req, res) {
    const id=Number(req.params.id);
    const menuItem=menuItems.find(item=>item.id===id);
    if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(menuItem);
}
module.exports = {
    getAllMenuItems,
    getMenuItemById
};
