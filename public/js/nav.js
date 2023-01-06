window.addEventListener("scroll", () => {
  document
    .querySelector("nav")
    .classList.toggle("navigationConScroll", window.scrollY > 12);
});
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
const links = document.querySelectorAll(".nav-links li");

hamburger.addEventListener("click", () => {
  //Links
  navLinks.classList.toggle("open");
  links.forEach((link) => {
    link.classList.toggle("fade");
  });

  //Animation
  hamburger.classList.toggle("toggle");
});
// last
