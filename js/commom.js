/* Marks the navigation link of the page currently open as active,
   so .active does not have to be written by hand on every page. */
const currentFile = window.location.pathname.split("/").pop() || "index.html";
const navLinks = document.querySelectorAll(".nav-links a");

navLinks.forEach(function (link) {
    const linkFile = link.getAttribute("href").split("/").pop();
    link.classList.toggle("active", linkFile === currentFile);
});
