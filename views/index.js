
let idMap = []
let todos = {}
const fetchTodo = () => {
  $.get('/read', function (data) {
    let result = ''
    for (let iter = 0; iter < data.length; iter++) {
      let checked = ''
      if (`${data[iter].status}` === `true`) {
        checked = 'checked'
      }
      todos[data[iter].id] = data[iter]
      result += `<li id=${data[iter].id}><input class='toggle' type="checkbox" ${checked}>
      <label id="todo-label-${data[iter].id}">${data[iter].description}</label>
      <input id="todo-edit-textbox-${data[iter].id}" class="edit" type="text" name="editableText">
      <button class="destroy"></button></li>`
      idMap.push(data[iter].id)
    }
    $('.todo-list').html((result))
    showActiveCount()
    afterRead()
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

// const myForm = $('#updateForm')[0]
// myForm.addEventListener('submit', e => {
//   e.preventDefault()
//   const id = $('[name="id"]')[0].value
//   const description = $('[name="description"]')[0].value
//   const done = $('[name="status"]')[0].value
//   console.log('Updating form with values : ', {id, description, done})
//   updateList(id, description, done)
// })

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
  if (statusValue === undefined) { statusValue = '' }
  let data = {
    description: descriptionText,
    status: statusValue
  }
  console.log(data)
  fetch(`/update/${idNumber}`,
    {
      method: 'put',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
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
function updateStatus (id, status) {
  let data = {
    status: status
  }
  fetch(`/update/${id}`,
    {
      method: 'put',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      return fetchTodo()
    }).catch(function (err) {
      console.log(err)
    })
}

function deleteList (id) {
  console.log('del')
  let escapedId = escapeHtml(id)
  // fetch(`/destroy/${idMap[escapedId - 1]}`, {method: 'delete'})
  fetch(`/destroy/${id}`, { method: 'delete' })
    .then((response) => {
      return fetchTodo()
    }).then()
    .catch(function (err) {
      console.log(err)
    })
}
function afterRead () {
  showClearComplete()
  $('.new-todo').keyup(function (event) {
    if (event.keyCode === 13) {
      console.log('enter key is pressed')
      writeList($('.new-todo').val())
      $('.new-todo').val('')
    }
  })
  $('.toggle').change(function () {
    (this.checked) ? updateStatus($(this).closest('li').attr('id'), true) : updateStatus($(this).closest('li').attr('id'), false)
  })

  $('.toggle-all').change(function () {
    const status = this.checked
    const toggle = (status) ? 'check' : 'uncheck'
    const warningReply = confirm(`Are you sure you want to ${toggle} all the items?`)
    if (warningReply === true) {
       $('.toggle').prop('checked', status)
      checkall(status)
    } else {
       $('.toggle-all').prop('checked', !this.checked)

      }
  })
  $('.destroy').click(function () {
    deleteList($(this).closest('li').attr('id'))
  })
  $('li').dblclick(function () {
    // console.log('double click')
    const value = $(this).find('label').hide().text()
    $(this).find('.edit').show().focus().val(value)
  })
  $('.edit').focusout(function () {
    // console.log('focusout')
    const changedContent = $(this).hide().val()
    if (changedContent === '') {
      deleteList($(this).closest('li').attr('id'))
    } else {
      const originalContent = $(this).prev().text()
      if (changedContent !== originalContent) {
        updateList($(this).closest('li').attr('id'), changedContent)
      } else {
        $(this).prev().show()
      }
    }
  })
  $('.edit').keyup(function (event) {
    if (event.which === 13) {
      $(this).focusout()
    } else if (event.which === 27) {
      // console.log('esc')
      $(this).off('focusout').hide()
      $(this).prev().show()
    }
  })
}
function showClearComplete () {
  const completedList = filterTodo(true);
  (Object.keys(completedList).length === 0) ? $('.clear-completed').hide() : $('.clear-completed').show()
}
function filterTodo (status) {
  // console.log('getActiveList')
  let filteredList = {}
  for (let key in todos) {
    if (todos[key].status === status) {
      filteredList[key] = todos[key]
    }
  }
  console.log('filtered list', filterList)
  return filteredList
}

function checkall (statusData) {
  let data = {
    status: statusData
  }
  fetch(`/checkAll`,
    {
      method: 'put',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      return fetchTodo()
    }).catch(function (err) {
      console.log(err)
    })
}
$(window).on('hashchange', () => filterList())
function filterList () {
  // console.log('filterList')
  const url = location.hash
  $('.filters a').prop('class', '')
  switch (url) {
    case '#/': $('a[href$="#/"').attr('class', 'selected')
      $('.todo-list li').show()
      break
    case '#/active': $('a[href$="#/active"]').attr('class', 'selected')
      $('.todo-list .active').show()
      $('.todo-list .completed').hide()
      break
    case '#/completed': $('a[href$="#/completed" ]').attr('class', 'selected')
      $('.todo-list .active').hide()
      $('.todo-list .completed').show()
      break
    default: $('a[href$="#/"').attr('class', 'selected')
      $('.todo-list li').show()
  }
}
function showActiveCount () {
  // console.log('showActiveCount')
  const activeList = filterTodo(false)
  const activeListCount = Object.keys(activeList).length
  const itemString = (activeListCount === 1) ? 'item' : 'items'
  $('.todo-count').text(`${activeListCount} ${itemString} left`);
  (activeListCount === 0) ? $('.toggle-all').prop('checked', true) : $('.toggle-all').prop('checked', false)
}
// window.onscroll = function () {
//   (pageYOffset >= 200) ? $('#scrollUp').fadeIn() : $('#scrollUp').fadeOut()
// }



// domlist
function getDomList () {
  let domList = '<ul class="todo-list">'
  let checked
  for (let key in todos) {
    let description = escapeHtml(todos[key].description)
    checked = (todos[key].status === true) ? 'checked' : ''
    domList += createLi(key, description, checked)
    if (todos[key].status === false) {
      $('.toggle-all').prop('checked', false)
    }
  }
  domList += '</ul>'
  return domList
}


function createLi (id, description, checked = '') {
  // console.log('createLi')
  const className = (checked === '') ? 'active' : 'completed'
  return `<li id="${id}" class ="${className}">
      <div class="view">
      <input class ="toggle" type="checkbox" id="todo-checkbox-${id}" ${checked}>
      <label id="todo-label-${id}">${description}</label>
      <input id="todo-edit-textbox-${id}" class="edit" type="text" name="editableText">
      <button id="todo-button-${id}" class="destroy"></button>
      </div>
      
      </li>`
}


function render () {
  const domList = getDomList()
  $('.todo-list').html(domList)
  $('.editTextbox').hide()
  showActiveCount()
  showClearComplete()
  hideWhenNoList()
  filterList()
  //itemFunctionality()
}

function hideWhenNoList () {
  // console.log('hideWhenNoList')
  if (Object.keys(todos).length === 0) {
    $('.footer').hide()
    $('.toggle-all').hide()
  } else {
    $('.footer').show()
    $('.toggle-all').show()
  }
}




