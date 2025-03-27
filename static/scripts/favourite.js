const favButton = document.querySelector(".testButton button");
console.log(favButton);

favButton.onclick = toggleFavourite;

function toggleFavourite() {
    favButton.classList.toggle("addFavourite");
}