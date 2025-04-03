// Fetching Userstatus from server
async function fetchUserStatus() {
    const response = await fetch('/api/user-status');
    console.log("fetching user status")
    return await response.json();
}

async function toggleFavorite(userStatus) {
    if(userStatus.isLoggedIn){
    const h1ELement = document.querySelector("h1");
    if(!h1ELement) return;
    drinkName = h1ELement.textContent.trim();
    if(userStatus.favoritedDrinks.includes(drinkName)){
        const favoritedButton = h1ELement.parentElement.querySelector(".heartButton");
        favoritedButton.classList.toggle("favourited");
    }} else{
        return
    }
}

async function showRelatedFavorites(userStatus) {
    const otherFavoritesSection = document.getElementById("otherUserFavorites");
    console.log(otherFavoritesSection)
    try {
        if (!userStatus.isLoggedIn) {
            otherFavoritesSection.insertAdjacentHTML("beforeend", `
                <div class="favoritesOverlay">
                    <p>Sign in to access all features!</p>
                    <a href="/login" class="login-button">Sign In</a>
                </div>
            `);
            return
        }
        if (userStatus.isLoggedIn && !userStatus.isAdult) {
            otherFavoritesSection.insertAdjacentHTML("beforeend", `
                <div class="favoritesOverlay">
                    <p>You must be 18+ to see these cocktails :')</p>
                </div>
            `);
            return
        }
    } catch (error) {
            console.error("showCocktailsOnLoad error:", error);
            otherFavoritesSection.innerHTML = "Error loading other users favorites";
    }
}

async function pageLoad(){
    try{
        userStatus = await fetchUserStatus();
        toggleFavorite(userStatus);
        showRelatedFavorites(userStatus);
    } catch(error){
        console.error("Error:", error);
    }
}
pageLoad()