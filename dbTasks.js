const Sequelize = require('sequelize')
var sequelize = new Sequelize('postgres://rishabsaxena:@localhost:5432/tododatabase')

function createTask (description) {
  const query = `insert into tasks (description,status) values (\'${description}\',false) returning id`
  const createTask = sequelize.query(query)
  return createTask
}

function readTask () {
  const query = `select id,description,status from tasks`
  const readTasks = sequelize.query(query)
  return readTasks
}

function updateTask (id, description, status) {
  if (!description) {
    const query = `update tasks set status = '${status}' where id = ${id} `
    return sequelize.query(query)
  }
  if (!status) {
    const query = `update tasks set description = '${description}' where id = ${id} `
    return sequelize.query(query)
  }
  const query = `update tasks set description = '${description}', status = '${status}' where id = ${id} `
  return sequelize.query(query)
}

function destroyTask (id) {
  const query = `delete from tasks where id = ${id}`
  const destroyTask = sequelize.query(query)
  return destroyTask
}

function activeTasks () {
  const query = `select description,status from tasks where status='false'`
  const activeTasks = sequelize.query(query)
  return activeTasks
}

function completedTasks () {
  const query = `select description,status from tasks where status='true'`
  const completedTasks = sequelize.query(query)
  return completedTasks
}

function checkAll (status) {
  const query = `UPDATE tasks SET status ='${status}'`
  const checkAll = sequelize.query(query)
  return checkAll
}
function clearCompleted () {
  const query = `delete from tasks where status='true'`
  const clearCompleted = sequelize.query(query)
  return clearCompleted
}
module.exports = { createTask, readTask, updateTask, destroyTask, activeTasks, completedTasks, checkAll, clearCompleted}
