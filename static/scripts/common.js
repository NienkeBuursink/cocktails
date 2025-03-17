// Store elements in variables

const buttonMenu = document.querySelector("nav button");
const ulMenu = document.querySelector("nav ul");


// eventlisteners
buttonMenu.addEventListener('click', toggleMenu);


// functions

function toggleMenu() {
    console.log("geen poep meer");
    ulMenu.classList.toggle("toonMenu");
    buttonMenu.classList.toggle("toonMenu");
  }