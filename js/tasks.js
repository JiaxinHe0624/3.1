/* Task manager for StudyTrack.
   Step 1 is just the login gate. Adding, editing, deleting and
   validating tasks come in the next two steps. */

/* ---------- storage keys ---------- */

// sessionStorage, not localStorage, on purpose: it wipes itself when
// the tab or the browser closes, so the next person on this computer
// is not still signed in as me.
const LOGIN_KEY = "studyplanner.session";

/* ---------- the one account that works ---------- */

// Hard coded here because the brief only asks for one login pair.
// This is a front end demo, not real authentication - anyone can open
// the source and read these. That limitation goes in the ethics page.
const VALID_USERNAME = "student";
const VALID_PASSWORD = "INFO1012";

/* ---------- elements ---------- */

// Grab everything once up here so the functions below do not have to
// keep searching the page.
const loginSection = document.getElementById("loginSection");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const appSection = document.getElementById("appSection");
const logoutBtn = document.getElementById("logoutBtn");

/* ---------- show and hide ---------- */

// Swapping the two 'hidden' classes is all the gate needs. The task
// elements never get destroyed, so nothing has to be rebuilt.
function showApp() {
    loginSection.classList.add("hidden");
    appSection.classList.remove("hidden");
}

function showLogin() {
    appSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
}

/* ---------- sign in ---------- */

function handleLogin(event) {
    // Without this the form really submits, the browser reloads the
    // page, and all the typing disappears. Classic first bug.
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Empty fields get their own message. Calling that a "wrong
    // password" would be misleading.
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

/* ---------- sign out ---------- */

function handleLogout() {
    sessionStorage.removeItem(LOGIN_KEY);
    loginError.textContent = "";
    usernameInput.value = "";
    passwordInput.value = "";
    showLogin();
}

/* ---------- wiring ---------- */

loginForm.addEventListener("submit", handleLogin);
logoutBtn.addEventListener("click", handleLogout);

// Already signed in during this session? Then skip the form. Handy
// while testing: refresh the page and you are still inside.
if (sessionStorage.getItem(LOGIN_KEY) === "true") {
    showApp();
}