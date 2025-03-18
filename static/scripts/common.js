// Store elements in variables

const buttonMenu = document.querySelector("header nav button");
const ulMenu = document.querySelector("header nav ul");


// eventlisteners
buttonMenu.addEventListener('click', toggleMenu);


// functions

function toggleMenu() {
    ulMenu.classList.toggle("toonMenu");
    buttonMenu.classList.toggle("toonMenu");
    console.log("werkt");
  }
