
let idMap = []
const fetchTodo = () => {
  $.get('/read', function (data) {
    var result = '<ol>'
    for (let iter = 0; iter < data.length; iter++) {
      result += `<li> ${data[iter].description} ${data[iter].id}   </li> `
      idMap.push(data[iter].id)
    }
    $('#result').html((result + '</ol>'))
    console.log(result)
  // idMap = data.map((element) => { return element.id })
  })
}
var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
}
const escapeHtml = string => String(string).replace(/[&<>"'`=\/]/g, s => entityMap[s])

function writeList (description) {
  console.log('read')
  let escapedDescription = escapeHtml(description)
  fetch(`/write/${escapedDescription}`, {
    method: 'post'
  }).then(function (response) {
    return fetchTodo()
  }).then(function (data) {
  }).catch(function (err) {
    console.log(err)
  })
}

const myForm = $('#updateForm')[0]
myForm.addEventListener('submit', e => {
  e.preventDefault()
  const id = $('[name="id"]')[0].value
  const description = $('[name="description"]')[0].value
  const done = 'false'
  console.log('Updating form with values : ', {id, description, done})
  updateList(id, description, done)
})

// const readForm = $('#createForm')[0]
// readForm.addEventListener('submit',e =>
// {
//   e.preventDefault()
//   const inputTodo = $('[name="inputTodo"]')[0].value
//   writeList(inputTodo)
// })

function updateList (idNumber, descriptionText, statusValue) {
  // debugger
  console.log('update', idNumber, descriptionText, statusValue)
  descriptionText = escapeHtml(descriptionText)
  let escapeId = escapeHtml(idNumber)
  statusValue = escapeHtml(statusValue)
  let data = { description: descriptionText,
    status: statusValue}
  fetch(`/update/${idMap[escapeId - 1]}`,
    {
      method: 'put',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }})
.then(function (response) {
  console.log('res')
  return fetchTodo()
}).then(function (data) {
  console.log('res2')
}).catch(function (err) {
  console.log('error')
  console.log(err)
})
}

function deleteList (id) {
  console.log('del')
  let escapedId = escapeHtml(id)
  fetch(`/destroy/${idMap[escapedId - 1]}`, {method: 'delete'})
.then((response) => {
  return fetchTodo()
}).then()
.catch(function (err) {
  console.log(err)
})
}

