const mongoose = require("mongoose");
const Todo = mongoose.model("Todo");


exports.getAllTodos = async (req, res) => {
    try {
        //console.log("GET ALL TODOS", req.user)
        const todos = await Todo.find({ userId: req.user }).sort({ created_at: -1 })
        //console.log(todos)
        res.status(200).send({ todos })
    } catch (error) {
        res.status(400).send(error)
    }
}


exports.newTodo = async (req, res) => {
    try {
        //console.log("MAKE A NEW TODO", req.body)
        const todo = new Todo({ userId: req.user, text: req.body.text, datum: req.body.datum, time: req.body.time, complete: false });
        await todo.save();
        //console.log("THE NEW TODO ", todo)
        res.status(200).send(todo)
    } catch (error) {
        res.status(400).send(error)
    }
}


exports.checked = async (req, res) => {
    try {
        let todoId = req.params.id;
        //console.log(req.body.complete)
        await Todo.findByIdAndUpdate(todoId, { complete: req.body.complete },
            function (err, docs) {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log("Updated Todo : ", docs);
                    res.status(200).send("Completed! ")
                }
            })
    } catch (error) {
        res.status(400).send(error)
    }
}


exports.delete = async (req, res) => {
    try {
        let todoId = req.params.id;
        await Todo.findByIdAndDelete(todoId, function (err, docs){
            if(err){

            }else{
                console.log("Deleted Todo : ", docs)
                res.status(200).send({ deletedTodo: docs});
            }
        });
    } catch (error) {
        res.status(400).send(error)
    }
}