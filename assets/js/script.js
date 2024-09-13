let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

function generateTaskId() {
  return nextId++;
}

function createTaskCard(task) {
  const dueDate = dayjs(task.dueDate);
  const today = dayjs();
  let cardClass = '';

  if (dueDate.isAfter(today)) {
    cardClass = 'task-card-green';
  } else if (dueDate.isSame(today, 'day')) {
    cardClass = 'task-card-yellow';
  } else {
    cardClass = 'task-card-red';
  }

  return `
  <div class="task-card card mb-3 ${cardClass}" id="task-${task.id}">
    <div class="card-body">
      <h5 class="card-title">${task.title}</h5>
      <p class="card-text">Due: ${dueDate.format('MM/DD/YYYY')}</p>
      <button class="btn btn-danger" onclick="handleDeleteTask(${task.id})">Delete</button>
    </div>
  </div>
  `;
}

function renderTaskList() {
  $("#todo-cards").empty();
  $('#in-progress-cards').empty();
  $("#done-cards").empty();

  taskList.forEach(task => {
    const taskCard = createTaskCard(task);
    if (task.status === 'To Do') {
      $("#todo-cards").append(taskCard);
    } else if (task.status === 'In Progress') {
      $("#in-progress-cards").append(taskCard);
    } else if (task.status === 'Done') {
      $("#done-cards").append(taskCard);
    }
  });

  $(".task-card").draggable({
    revert: "invalid",
    start: function(event, ui) {
      $(this).addClass("dragging");
    },
    stop: function(event, ui) {
      $(this).removeClass("dragging");
    }
  });

  $(".lane").droppable({
    accept: ".task-card",
    drop: function(event, ui) {
      const taskId = ui.draggable.attr("id").split("-")[1];
      const newStatus = $(this).find(".card-header h2").text();
      handleDrop(taskId, newStatus);
    }
  });
}

function handleAddTask(event) {
  event.preventDefault();
  const title = $("#title").val();
  const dueDate = $("#dueDate").val();

  const task = {
    id: generateTaskId(),
    title: title,
    dueDate: dueDate,
    status: 'To Do'
  };
  taskList.push(task);
  localStorage.setItem('tasks', JSON.stringify(taskList));
  localStorage.setItem("nextId", nextId);
  renderTaskList();
  $("#formModal").modal('hide');
}

function handleDeleteTask(taskId) {
  taskList = taskList.filter(task => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

function handleDrop(taskId, newStatus) {
  taskList.forEach(task => {
    if (task.id == taskId) {
      task.status = newStatus;
    }
  });
  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();
}

$(document).ready(function () {
  renderTaskList();
  $("#addForm").on("submit", handleAddTask);
  $("#dueDate").datepicker();
});
