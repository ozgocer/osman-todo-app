const STORAGE_KEY = "osman-todo-tasks";
const THEME_STORAGE_KEY = "osman-todo-theme";
const PRIORITIES = ["Düşük", "Orta", "Yüksek"];
const CATEGORIES = ["İş", "Kişisel", "Eğitim"];
const CHECK_ICON =
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12.5 4.25 4.25L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const TRASH_ICON =
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16m-10 4v6m4-6v6M5 7l1 13h12l1-13M9 7V4h6v3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SUN_ICON = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const MOON_ICON = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskDueDate = document.querySelector("#task-due-date");
const taskPriority = document.querySelector("#task-priority");
const taskCategory = document.querySelector("#task-category");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyDescription = document.querySelector("#empty-description");
const taskTotal = document.querySelector("#task-total");
const remainingCount = document.querySelector("#remaining-count");
const progressCount = document.querySelector("#progress-count");
const progressTrack = document.querySelector("#progress-track");
const progressFill = document.querySelector("#progress-fill");
const statusMessage = document.querySelector("#status-message");
const todayLabel = document.querySelector("#today-label");
const filterButtons = document.querySelectorAll(".filter-button");
const themeToggle = document.querySelector("#theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');

let tasks = loadTasks();
let activeFilter = "all";
let currentTheme = loadTheme();

todayLabel.textContent = new Intl.DateTimeFormat("tr-TR", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date());

applyTheme();
renderTasks();

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();

  if (!title) {
    taskInput.value = "";
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: createTaskId(),
    title,
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate: taskDueDate.value,
    priority: taskPriority.value,
    category: taskCategory.value,
  });
  activeFilter = "all";
  updateActiveFilter();
  taskInput.value = "";
  taskDueDate.value = "";
  taskPriority.value = "Orta";
  taskCategory.value = "Kişisel";
  persistAndRender();
  taskInput.focus();
});

themeToggle.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
  } catch (error) {
    console.error("Tema tercihi kaydedilemedi:", error);
    announce("Tema tercihi bu cihazda kaydedilemedi.");
  }
  applyTheme();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    updateActiveFilter();
    renderTasks();
  });
});

taskList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const taskItem = button.closest("[data-task-id]");
  const task = tasks.find((item) => item.id === taskItem?.dataset.taskId);
  if (!task) return;

  if (button.dataset.action === "toggle") {
    task.completed = !task.completed;
    announce(task.completed ? "Görev tamamlandı." : "Görev yeniden etkinleştirildi.");
  } else if (button.dataset.action === "delete") {
    tasks = tasks.filter((item) => item.id !== task.id);
    announce("Görev silindi.");
  } else {
    return;
  }

  persistAndRender();
});

function loadTasks() {
  try {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    if (!storedTasks) return [];

    const parsedTasks = JSON.parse(storedTasks);
    if (
      !Array.isArray(parsedTasks) ||
      parsedTasks.some(
        (task) =>
          typeof task.id !== "string" ||
          typeof task.title !== "string" ||
          typeof task.completed !== "boolean" ||
          typeof task.createdAt !== "string",
      )
    ) {
      throw new Error("Görev verileri beklenen biçimde değil.");
    }

    return parsedTasks.map((task) => ({
      ...task,
      dueDate: typeof task.dueDate === "string" ? task.dueDate : "",
      priority: PRIORITIES.includes(task.priority) ? task.priority : "Orta",
      category: CATEGORIES.includes(task.category) ? task.category : "Kişisel",
    }));
  } catch (error) {
    console.error("Görevler yüklenemedi:", error);
    announce("Kaydedilmiş görevler yüklenemedi. Yeni görev ekleyebilirsin.");
    return [];
  }
}

function loadTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch (error) {
    console.error("Tema tercihi yüklenemedi:", error);
    return "light";
  }
}

function applyTheme() {
  const isDark = currentTheme === "dark";
  document.documentElement.dataset.theme = currentTheme;
  themeToggle.innerHTML = isDark ? SUN_ICON : MOON_ICON;
  themeToggle.setAttribute("aria-label", isDark ? "Açık temayı aç" : "Koyu temayı aç");
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeColor.setAttribute("content", isDark ? "#171725" : "#f5f6fa");
}

function createTaskId() {
  return globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function persistAndRender() {
  let saveError;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    saveError = error;
    console.error("Görevler kaydedilemedi:", error);
  }

  renderTasks();

  if (saveError) {
    announce("Görevler bu cihazda kaydedilemedi. Tarayıcı depolama alanını kontrol et.");
  }
}

function renderTasks() {
  const visibleTasks = tasks.filter((task) => {
    if (activeFilter === "active") return !task.completed;
    if (activeFilter === "completed") return task.completed;
    return true;
  });
  const completedCount = tasks.filter((task) => task.completed).length;
  const activeCount = tasks.length - completedCount;

  taskList.replaceChildren(...visibleTasks.map(createTaskElement));
  taskList.hidden = visibleTasks.length === 0;
  emptyState.hidden = visibleTasks.length > 0;
  taskTotal.textContent = `${tasks.length} görev`;
  remainingCount.textContent = activeCount ? `${activeCount} görev kaldı` : "";
  progressCount.textContent = `${completedCount} / ${tasks.length}`;
  progressTrack.setAttribute("aria-valuemax", String(tasks.length));
  progressTrack.setAttribute("aria-valuenow", String(completedCount));
  progressFill.style.width = tasks.length
    ? `${(completedCount / tasks.length) * 100}%`
    : "0%";

  if (tasks.length === 0) {
    emptyTitle.textContent = "Listen tertemiz!";
    emptyDescription.textContent = "Başlamak için yukarıdan yeni bir görev ekle.";
  } else if (activeFilter === "active") {
    emptyTitle.textContent = "Bekleyen görevin yok";
    emptyDescription.textContent = "Harika iş! Tüm görevlerin tamamlandı.";
  } else if (activeFilter === "completed") {
    emptyTitle.textContent = "Henüz tamamlanan yok";
    emptyDescription.textContent = "Bir görevi bitirdiğinde burada görebilirsin.";
  }
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.completed ? " is-completed" : ""}`;
  if (isOverdue(task)) item.classList.add("is-overdue");
  item.dataset.taskId = task.id;

  const toggleButton = document.createElement("button");
  toggleButton.className = "task-toggle";
  toggleButton.type = "button";
  toggleButton.dataset.action = "toggle";
  toggleButton.setAttribute(
    "aria-label",
    task.completed ? `Görevi yeniden etkinleştir: ${task.title}` : `Tamamla: ${task.title}`,
  );
  toggleButton.setAttribute("aria-pressed", String(task.completed));
  toggleButton.innerHTML = CHECK_ICON;

  const content = document.createElement("div");
  content.className = "task-content";
  const title = document.createElement("span");
  title.className = "task-text";
  title.textContent = task.title;

  const date = document.createElement("span");
  date.className = "task-date";
  date.textContent = formatTaskDate(task.createdAt);
  content.append(title, date);

  const metadata = document.createElement("div");
  metadata.className = "task-metadata";

  const priority = document.createElement("span");
  priority.className = `task-badge priority-${priorityClass(task.priority)}`;
  priority.textContent = task.priority;

  const category = document.createElement("span");
  category.className = "task-badge category-badge";
  category.textContent = task.category;
  metadata.append(priority, category);

  if (task.dueDate) {
    const dueDate = document.createElement("span");
    dueDate.className = "task-badge due-date";
    if (isOverdue(task)) dueDate.classList.add("is-overdue");
    dueDate.textContent = `Son tarih: ${formatDueDate(task.dueDate)}`;
    metadata.append(dueDate);
  }
  content.append(metadata);

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.setAttribute("aria-label", `Sil: ${task.title}`);
  deleteButton.innerHTML = TRASH_ICON;

  item.append(toggleButton, content, deleteButton);
  return item;
}

function priorityClass(priority) {
  if (priority === "Düşük") return "low";
  if (priority === "Yüksek") return "high";
  return "medium";
}

function isOverdue(task) {
  return Boolean(task.dueDate && !task.completed && task.dueDate < getLocalDateString());
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDueDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTaskDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function updateActiveFilter() {
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === activeFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function announce(message) {
  statusMessage.textContent = message;
}

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("Çevrimdışı destek başlatılamadı:", error);
    });
  });
}
