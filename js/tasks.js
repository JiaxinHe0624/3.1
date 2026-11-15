/* Task manager for StudyTrack.
   Login gate, then the task list: add, edit, delete, sort by due
   date, input validation, and the live clock at the bottom. */

/* ---------- storage keys ---------- */

// sessionStorage clears itself when the tab or browser closes, so the
// next person on this computer is not still signed in as me.
const LOGIN_KEY = "studyplanner.session";

// localStorage keeps the tasks between visits, which is the point
// of the app: refresh the page and the list is still there.
const TASKS_KEY = "studyplanner.tasks";

/* ---------- the one account that works ---------- */

// Hard coded because the brief asks for one login pair. This is a
// front end demo, not real authentication - anyone can read these
// in the source. The ethics page says so out loud.
const VALID_USERNAME = "student";
const VALID_PASSWORD = "INFO1012";

/* ---------- elements ---------- */

const loginSection = document.getElementById("loginSection");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const appSection = document.getElementById("appSection");
const logoutBtn = document.getElementById("logoutBtn");

const taskForm = document.getElementById("taskForm");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const taskTitle = document.getElementById("taskTitle");
const courseCode = document.getElementById("courseCode");
const courseName = document.getElementById("courseName");
const dueDate = document.getElementById("dueDate");
const description = document.getElementById("description");
const notes = document.getElementById("notes");

const titleError = document.getElementById("titleError");
const courseCodeError = document.getElementById("courseCodeError");
const courseNameError = document.getElementById("courseNameError");
const dueDateError = document.getElementById("dueDateError");
const descriptionError = document.getElementById("descriptionError");

const taskTableBody = document.getElementById("taskTableBody");
const emptyMessage = document.getElementById("emptyMessage");
const clock = document.getElementById("clock");

/* ---------- state ---------- */

// Every task lives in this array. It is the single source of truth;
// the table is only a picture of it.
let tasks = [];

// null means the form is in "add" mode. An id means "edit that task".
let editingId = null;

/* ---------- load and save ---------- */

// Read the saved list. If the stored value is missing or damaged,
// fall back to an empty array instead of crashing the whole page.
function loadTasks() {
    try {
        const raw = localStorage.getItem(TASKS_KEY);
        tasks = raw ? JSON.parse(raw) : [];
    } catch (error) {
        tasks = [];
    }
}

function saveTasks() {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

/* ---------- validation helpers ---------- */

// Shows or clears the message under one field, and paints the field
// red so the mistake is obvious without reading the text.
function setError(input, errorBox, message) {
    errorBox.textContent = message;
    if (message === "") {
        input.classList.remove("invalid");
    } else {
        input.classList.add("invalid");
    }
}

// A date input can hold something like 2026-02-30, which does not
// exist. new Date() silently rolls it to 2 March, so the parts are
// read back and compared to what the user actually typed.
function isValidDate(value) {
    if (value === "") {
        return false;
    }

    const parts = value.split("-");
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    const test = new Date(year, month - 1, day);

    return test.getFullYear() === year
        && test.getMonth() === month - 1
        && test.getDate() === day;
}

// Checks the whole form. Returns true only when nothing is wrong,
// and writes a message under each field that failed.
function validateForm() {
    let ok = true;

    if (taskTitle.value.trim() === "") {
        setError(taskTitle, titleError, "A task title is required.");
        ok = false;
    } else {
        setError(taskTitle, titleError, "");
    }

    if (courseCode.value.trim() === "") {
        setError(courseCode, courseCodeError, "A course code is required.");
        ok = false;
    } else {
        setError(courseCode, courseCodeError, "");
    }

    if (courseName.value.trim() === "") {
        setError(courseName, courseNameError, "A course name is required.");
        ok = false;
    } else {
        setError(courseName, courseNameError, "");
    }

    if (!isValidDate(dueDate.value)) {
        setError(dueDate, dueDateError, "Pick a real date, for example 2026-11-20.");
        ok = false;
    } else {
        setError(dueDate, dueDateError, "");
    }

    if (description.value.trim() === "") {
        setError(description, descriptionError, "A short description is required.");
        ok = false;
    } else {
        setError(description, descriptionError, "");
    }

    return ok;
}

/* ---------- rendering ---------- */

// Today as yyyy-mm-dd, in the same shape as a date input value, so
// the two can be compared as plain strings.
function todayString() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return now.getFullYear() + "-" + month + "-" + day;
}

// Rebuilds the table from the tasks array. Cells are created with
// textContent rather than innerHTML on purpose: if a user types
// "<script>" into a task title it stays plain text and never runs.
function renderTasks() {
    taskTableBody.innerHTML = "";

    if (tasks.length === 0) {
        emptyMessage.classList.remove("hidden");
    } else {
        emptyMessage.classList.add("hidden");
    }

    // A copy is sorted, so the stored order never changes.
    const sorted = tasks.slice().sort(function (a, b) {
        return a.dueDate.localeCompare(b.dueDate);
    });

    const today = todayString();

    sorted.forEach(function (task) {
        const row = document.createElement("tr");

        const titleCell = document.createElement("td");
        titleCell.textContent = task.title;

        const courseCell = document.createElement("td");
        courseCell.textContent = task.courseCode + " " + task.courseName;

        const dueCell = document.createElement("td");
        dueCell.textContent = task.dueDate;
        if (task.dueDate < today) {
            // Anything already past its date stands out in red.
            dueCell.classList.add("overdue");
        }

        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = task.description;

        const notesCell = document.createElement("td");
        notesCell.textContent = task.notes === "" ? "-" : task.notes;

        const actionsCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn-outline";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", function () {
            startEdit(task.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn-outline";
        deleteButton.textContent = "Delete";
        deleteButton.style.marginLeft = "6px";
        deleteButton.addEventListener("click", function () {
            deleteTask(task.id);
        });

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);

        row.appendChild(titleCell);
        row.appendChild(courseCell);
        row.appendChild(dueCell);
        row.appendChild(descriptionCell);
        row.appendChild(notesCell);
        row.appendChild(actionsCell);

        taskTableBody.appendChild(row);
    });
}

/* ---------- form state ---------- */

// Clears the form and puts it back into "add" mode.
function resetForm() {
    editingId = null;
    taskForm.reset();
    formTitle.textContent = "Add a task";
    submitBtn.textContent = "Add task";
    cancelEditBtn.classList.add("hidden");

    setError(taskTitle, titleError, "");
    setError(courseCode, courseCodeError, "");
    setError(courseName, courseNameError, "");
    setError(dueDate, dueDateError, "");
    setError(description, descriptionError, "");
}

// Copies one task into the form so it can be changed.
function startEdit(id) {
    const task = tasks.find(function (item) {
        return item.id === id;
    });

    if (!task) {
        return;
    }

    editingId = id;
    taskTitle.value = task.title;
    courseCode.value = task.courseCode;
    courseName.value = task.courseName;
    dueDate.value = task.dueDate;
    description.value = task.description;
    notes.value = task.notes;

    formTitle.textContent = "Edit task";
    submitBtn.textContent = "Save changes";
    cancelEditBtn.classList.remove("hidden");

    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- add, edit, delete ---------- */

function handleTaskSubmit(event) {
    // Without this the form submits for real and the page reloads,
    // which loses the typing and looks like nothing happened.
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    const values = {
        title: taskTitle.value.trim(),
        courseCode: courseCode.value.trim(),
        courseName: courseName.value.trim(),
        dueDate: dueDate.value,
        description: description.value.trim(),
        notes: notes.value.trim()
    };

    if (editingId === null) {
        // Add: a cheap unique id, good enough for a local list.
        tasks.push(Object.assign({ id: Date.now().toString(36) }, values));
    } else {
        // Edit: overwrite only the fields the user could change.
        const index = tasks.findIndex(function (item) {
            return item.id === editingId;
        });
        if (index !== -1) {
            tasks[index] = Object.assign({ id: editingId }, values);
        }
    }

    saveTasks();
    renderTasks();
    resetForm();
}

function deleteTask(id) {
    const task = tasks.find(function (item) {
        return item.id === id;
    });

    if (!task) {
        return;
    }

    // The brief requires a confirmation step before anything is
    // removed, so a misclick never destroys a task.
    const confirmed = window.confirm("Delete \"" + task.title + "\"? This cannot be undone.");
    if (!confirmed) {
        return;
    }

    tasks = tasks.filter(function (item) {
        return item.id !== id;
    });

    saveTasks();
    renderTasks();

    // Deleting the task that was being edited leaves a stale id.
    if (editingId === id) {
        resetForm();
    }
}

/* ---------- login gate ---------- */

function showApp() {
    loginSection.classList.add("hidden");
    appSection.classList.remove("hidden");
}

function showLogin() {
    appSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
}

function handleLogin(event) {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Empty fields get their own message. Calling that a wrong
    // password would be misleading.
    if (username === "" || password === "") {
        loginError.textContent = "Enter both a username and a password.";
        return;
    }

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        loginError.textContent = "";
        sessionStorage.setItem(LOGIN_KEY, "true");
        showApp();
        return;
    }

    loginError.textContent = "Username or password is incorrect.";
}

function handleLogout() {
    sessionStorage.removeItem(LOGIN_KEY);
    loginError.textContent = "";
    usernameInput.value = "";
    passwordInput.value = "";
    showLogin();
}

/* ---------- clock ---------- */

// Redrawn once a second so the seconds actually move.
function updateClock() {
    clock.textContent = new Date().toLocaleString("en-AU", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

/* ---------- start ---------- */

loginForm.addEventListener("submit", handleLogin);
logoutBtn.addEventListener("click", handleLogout);
taskForm.addEventListener("submit", handleTaskSubmit);
cancelEditBtn.addEventListener("click", resetForm);

loadTasks();
renderTasks();
updateClock();
window.setInterval(updateClock, 1000);

// Already signed in during this session? Skip the form.
if (sessionStorage.getItem(LOGIN_KEY) === "true") {
    showApp();
}