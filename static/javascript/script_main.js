const backend = "http://127.0.0.1:5000"

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    const page = document.getElementById(pageId);
    if (page) page.style.display = "block";
}

// Navbar clicks
document.getElementById("nav-exercises").addEventListener("click", e => {
    e.preventDefault();
    history.pushState({ page: "exercisesPage" }, "", "/exercises");
    showPage("exercisesPage");
});

document.getElementById("nav-progress").addEventListener("click", e => {
    e.preventDefault();
    history.pushState({ page: "progressPage" }, "", "/progress");
    showPage("progressPage");
    // renderSampleProgress(); // render sample cards when opening
});

document.getElementById("nav-muscle").addEventListener("click", e => {
    e.preventDefault();
    history.pushState({ page: "musclePage" }, "", "/muscle");
    showPage("musclePage");
});

window.addEventListener("popstate", () => {
    const path = window.location.pathname;
    if (path === "/progress") showPage("progressPage");
    else if (path === "/muscle") showPage("musclePage");
    else showPage("exercisesPage"); // default
});



document.getElementById("nav-exercises").addEventListener("click", (e) => {
  e.preventDefault();
  renderExercisesPage();
});

document.getElementById("nav-progress").addEventListener("click", (e) => {
  e.preventDefault();
  renderProgressPage();
});

document.getElementById("nav-muscle").addEventListener("click", (e) => {
  e.preventDefault();
  renderMuscleGroupsPage();
});