// Store elements in variables

const buttonMenu = document.querySelector("nav button");
const ulMenu = document.querySelector("nav ul");


// eventlisteners
buttonMenu.addEventListener('click', toggleMenu);


// functions

function toggleMenu() {
    ulMenu.classList.toggle("showMenu");
    buttonMenu.classList.toggle("showMenu");
  }
