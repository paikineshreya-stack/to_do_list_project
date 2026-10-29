
const STORAGE_KEY = "taskflow_tasks_v1";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const remainingText = document.getElementById("remainingText");
const clearCompleted = document.getElementById("clearCompleted");

let tasks = loadTasks();
let currentFilter = "all";

// Display today's date
document.getElementById("today").textContent =
  new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

// Load saved tasks
function loadTasks() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

// Save tasks in the browser
function saveTasks() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(tasks)
  );
}

// Add a new task
function addTask(text) {
  const trimmed = text.trim();

  if (!trimmed) return;

  tasks.unshift({
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()),
    text: trimmed,
    completed: false,
    createdAt: Date.now()
  });

  saveTasks();
  render();
}

// Mark a task completed or pending
function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id
      ? { ...task, completed: !task.completed }
      : task
  );

  saveTasks();
  render();
}

// Delete a task
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);

  saveTasks();
  render();
}

// Display tasks and update counts
function render() {
  const completed = tasks.filter(
    task => task.completed
  ).length;

  const pending = tasks.length - completed;

  totalCount.textContent = tasks.length;
  pendingCount.textContent = pending;
  completedCount.textContent = completed;

  remainingText.textContent = pending
    ? `${pending} task${pending === 1 ? "" : "s"} left to do`
    : "You're all caught up!";

  // Filter tasks
  const visible = tasks.filter(task =>
    currentFilter === "all" ||
    (currentFilter === "pending" && !task.completed) ||
    (currentFilter === "completed" && task.completed)
  );

  taskList.replaceChildren();

  // Show a message if no tasks are available
  if (!visible.length) {
    const empty = document.createElement("li");
    empty.className = "empty";

    const emoji = document.createElement("div");
    emoji.className = "emoji";
    emoji.textContent =
      currentFilter === "completed" ? "🎉" : "📝";

    const title = document.createElement("strong");
    title.textContent =
      currentFilter === "completed"
        ? "No completed tasks yet"
        : "Your list is clear";

    const note = document.createElement("span");
    note.textContent =
      currentFilter === "pending"
        ? "All tasks are complete. Nice work!"
        : "Add a task above to get started.";

    empty.append(emoji, title, note);
    taskList.append(empty);
  } else {
    // Create each task
    visible.forEach(task => {
      const li = document.createElement("li");

      li.className =
        `task${task.completed ? " done" : ""}`;

      // Complete task button
      const check = document.createElement("button");
      check.className = "check";
      check.type = "button";

      check.setAttribute(
        "aria-label",
        task.completed
          ? "Mark task as pending"
          : "Mark task as completed"
      );

      check.textContent = task.completed ? "✓" : "";

      check.addEventListener("click", () =>
        toggleTask(task.id)
      );

      // Task text
      const text = document.createElement("span");
      text.className = "task-text";
      text.textContent = task.text;

      // Delete task button
      const del = document.createElement("button");
      del.className = "delete";
      del.type = "button";
      del.setAttribute("aria-label", "Delete task");
      del.textContent = "×";

      del.addEventListener("click", () =>
        deleteTask(task.id)
      );

      li.append(check, text, del);
      taskList.append(li);
    });
  }
}

// Handle adding a task
taskForm.addEventListener("submit", event => {
  event.preventDefault();

  addTask(taskInput.value);

  taskInput.value = "";
  taskInput.focus();
});

// Handle task filters
document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    document.querySelectorAll(".filter").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    render();
  });
});

// Remove completed tasks
clearCompleted.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);

  saveTasks();
  render();
});

// Display tasks when the page loads
render();
