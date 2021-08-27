const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/authMiddle");
const todoController = require("../controller/todo.controller");

//middleware
router.use(requireAuth);
//get all Todos
router.get("/", todoController.getAllTodos);
//make a new Todo
router.post("/", todoController.newTodo);
//update a Todo as checked
router.put("/:id", todoController.checked);
//delete a Todo
router.delete("/:id", todoController.delete);

module.exports = router;
