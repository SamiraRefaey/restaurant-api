const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
router.get("/",menuController.getAllMenuItems)
router.get("/:id",menuController.getMenuItemById)
router.post("/",menuController.createMenuItem)

module.exports = router;