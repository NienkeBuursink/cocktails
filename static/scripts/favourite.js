const favButton = document.querySelector(".heartButton");
console.log(favButton);

favButton.onclick = toggleFavourite;

function toggleFavourite() {
    favButton.classList.toggle("addFavourite");
}