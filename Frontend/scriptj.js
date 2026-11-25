
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");


// Mobile Navigation

menuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("show");
});


// Close Mobile Menu After Clicking a Link

document.querySelectorAll(".nav-links a").forEach(function (link) {

    link.addEventListener("click", function () {
        navLinks.classList.remove("show");
    });

});


// Current Year in Footer

document.getElementById("currentYear").textContent =
    new Date().getFullYear();
