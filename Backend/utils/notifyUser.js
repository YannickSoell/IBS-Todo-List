const sendMail = require("./emailSender");
const mongoose = require("mongoose");
const Todo = mongoose.model("Todo");
const User = mongoose.model("User");
const moment = require("moment");

const today = moment().format("YYYY-MM-DD");
//Delay 86400000 sec = 1 day
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

  todos.forEach(async (todo) => {
    //Function sendMail(email, text, subject)
    sendMail(todo.email[0], todo.todoText, `Heute ${todo.count} fällig!`);
  });
}

module.exports = function notifyUser() {
  //Find todos of today and send email notification to user with a Time Interval
  findTodoSendEmail();
  setInterval(findTodoSendEmail, delay);
};
