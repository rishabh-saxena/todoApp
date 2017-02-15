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
let todos = {}
const escapeHtml = string => String(string).replace(/[&<>"'`=\/]/g, s => entityMap[s])
function read () {
  $.get('/read', (data) => {
    data.forEach(function (item) {
      todos[item.id] = item
    })
    render()
    listFunctionality()
  })
}
function render () {
  console.log(' render is being called')
  const domList = getDomList()
  console.log(domList)
  $('.todo-list').html((domList))
  $('.editTextbox').hide()
  showActiveCount()
  showClearComplete()
  hideWhenNoList()
  filterList()
  itemFunctionality()
}
function showClearComplete () {
  // console.log('showClearComplete')
  const completedList = filterTodo(true);
  (Object.keys(completedList).length === 0) ? $('.clear-completed').hide() : $('.clear-completed').show()
}

function showActiveCount () {
  // console.log('showActiveCount')
  const activeList = filterTodo(false)
  const activeListCount = Object.keys(activeList).length
  const itemString = (activeListCount === 1) ? 'item' : 'items'
  $('.todo-count').text(`${activeListCount} ${itemString} left`);
  (activeListCount === 0) ? $('.toggle-all').prop('checked', true) : $('.toggle-all').prop('checked', false)
}
function filterTodo (status) {
  // console.log('getActiveList')
  let filteredList = {}
  for (let key in todos) {
    if (todos[key].status === status) {
      filteredList[key] = todos[key]
    }
  }
  return filteredList
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
function getDomList () {
  let domList = '<ul class="todo-list">'
  console.log('domlist called')
  console.log(todos)
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

function updateStatus (id, status) {
  let data = {
    status: status
  }
  todos[id].status = status
  fetch(`/update/${id}`,
    {
      method: 'put',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      render()
    }).catch(function (err) {
      console.log(err)
    })
}

function updateDescription (id, description) {
  let data = {
    description: description
  }
  todos[id].description = description
  fetch(`/update/${id}`,
    {method: 'put',
      body: JSON.stringify(data),
      headers:
      {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      render()
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
      delete todos[id]
      render()
    }).then()
    .catch(function (err) {
      console.log(err)
    })
}

function checkall (statusData) {
  let data = {
    status: statusData
  }
  for (let key in todos) {
    todos[key].status = statusData
  }
  fetch(`/checkAll`,
    {
      method: 'put',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      render()
    }).catch(function (err) {
      console.log(err)
    })
}
function writeList (description) {
  $.post(`/write/${escapeHtml(description)}`, function (data) {
   // console.log('check', data)
    todos[data] = { 'description': escapeHtml(description), 'status': false }
    $('.new-todo').val('')
    $('html, body').animate({ scrollTop: $(document).height() }, 'slow')
    render()
  })
}
function itemFunctionality () {
  $('.destroy').click(function () {
    deleteList($(this).closest('li').attr('id'))
  })
  $('.toggle').change(function () {
    const id = $(this).closest('li').attr('id');
    (this.checked) ? updateStatus(id, true) : updateStatus(id, false)
  })
  $('li').dblclick(function () {
    const value = $(this).find('label').hide().text()
    $(this).find('.destroy').hide()
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
        updateDescription($(this).closest('li').attr('id'), changedContent)
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
function listFunctionality () {
  // console.log('listFunctionality')
  $('.header .new-todo').keyup(function (event) {
    const content = $('.new-todo').val()
    if (event.keyCode === 13 && content !== '') {
      console.log('keyevent called')
      writeList(content)
    }
  })
  $('.toggle-all').change(function () {
    const status = this.checked
    const toggle = (status) ? 'check' : 'uncheck'
    const r = confirm(`Are you u want to ${toggle} all items?`)
    if (r === true) {
      $('.toggle').prop('checked', status)
      checkall(status)
    } else {
      $('.toggle-all').prop('checked', !this.checked)
    }
  })
  $('.clear-completed').click(() => {
    fetch(`/destroy/`, { method: 'delete' })
    .then((response) => {
      for (let key in todos) {
        if (todos[key].status === true) {
          delete todos[key]
        }
      }
      render()
    }).then()
    .catch(function (err) {
      console.log(err)
    })
  })

  $(window).on('hashchange', () => filterList())

  // $('#scrollUp').click(function () {
  //   $('html, body').animate({ scrollTop: 0 }, 800)
  //   return false
  // })
}
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

$(document).ready(read())
