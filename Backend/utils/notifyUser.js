const sendMail = require("./emailSender");
const mongoose = require("mongoose");
const Todo = mongoose.model("Todo");
const User = mongoose.model("User");
const moment = require("moment");

const today = moment().format("YYYY-MM-DD");
const delay = 86400000;

async function findTodoSendEmail() {
  console.log("findTodoSendEmail methode");
  console.log("today ", today);

  const todos = await Todo.aggregate([
    {
      $match: { $and: [{ datum: today }, { complete: false }] },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $group: {
        _id: "$userId",
        count: { $sum: 1 },
        todoText: { $push: "$text" },
        email: { $first: "$user.email" },
      },
    },
  ]);

  //console.log("todos ", todos)

  todos.forEach(async (todo) => {
    //TODO: Auskommentieren
    //sendMail(todo.email[0], todo.todoText, `Heute ${todo.count} fällig!`)
  });

  //sendMail(/*emial, text, subject*/)
}

module.exports = function notifyUser() {
  findTodoSendEmail();
  setInterval(findTodoSendEmail, delay);
};

// mongo
// _id: 60dcac088236ec24708cad66
// complete: false
// userId: 60d4617f6905e51c64b69d71
// text: "test"
// datum: "2021-06-30"
// time: "09:00"
// created_at: 2021-06-30T17:38:16.126+00:00
// updatedAt: 2021-06-30T17:38:16.126+00:00
// __v: 0
