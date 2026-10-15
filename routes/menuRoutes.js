const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// GET /api/menu — list all menu items.
router.get('/', menuController.getAllMenuItems);
// GET /api/menu/:id — get one menu item.
router.get('/:id', menuController.getMenuItemById);
// POST /api/menu — create a menu item.
router.post('/', menuController.createMenuItem);
// PUT /api/menu/:id — replace a menu item's editable fields.
router.put('/:id', menuController.updateMenuItem);
// PATCH /api/menu/:id — update selected fields on a menu item.
router.patch('/:id', menuController.patchMenuItem);
// DELETE /api/menu/:id — delete a menu item.
router.delete('/:id', menuController.deleteMenuItem);

module.exports = router;
