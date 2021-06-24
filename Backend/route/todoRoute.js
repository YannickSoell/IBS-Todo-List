const express = require("express");
const router = express.Router();
const requireAuth = require('../middleware/authMiddle');
const todoController = require('../controller/todo.controller');
router.use(requireAuth);

router.get('/', todoController.getAllTodos);
router.post('/', todoController.newTodo);
router.put('/:id', todoController.checked);
router.delete('/:id', todoController.delete);

module.exports = router;
