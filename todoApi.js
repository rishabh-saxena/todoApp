const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser')
const {createTask, readTask, updateTask, destroyTask, activeTasks, completedTasks} = require('./dbTasks')
// const filePath = process.argv[2]
const app = express()
app.use(express.static('views'))
// app.use(bodyParser());
app.use(bodyParser.json({
  extended: true
}))
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())
app.get('/read', function (req, res) {
  const readTasks = readTask()
  readTasks.then((tasks) => { res.json(tasks[0]) })
  .catch(() => { res.sendStatus(500) })
})
app.post('/write/:message', function (req, res) {
  const taskMessage = req.params.message
  const createTasks = createTask(taskMessage)
  createTasks.then(() => { res.send('Successfully added to the database') })
  .catch(() => { res.sendStatus(500) })
})
app.put('/update/:id', function (req, res) {
  const id = req.params.id
  const description = req.body.description
  const status = req.body.status
  console.log('update log in server api')
  const updateInfo = updateTask(id, description, status)
  updateInfo.then(() => { res.send('Updated the information') })
  .catch(() => { res.sendStatus(500) })
})
app.delete('/destroy/:id', function (req, res) {
  const id = req.params.id
  const deleteTask = destroyTask(id)
  deleteTask.then(() => { res.send('Deleted the information') })
  .catch(() => { res.sendStatus(500) })
})
app.get('/active', function (req, res) {
  const active = activeTasks()
  active.then((data) => { return res.send(data[0]) })
  .catch(() => { res.sendStatus(500) })
})
app.get('/completed', function (req, res) {
  const completed = completedTasks()
  completed.then((data) => res.send(data))
  .catch(() => { res.sendStatus(500) })
})
app.listen(3426)
