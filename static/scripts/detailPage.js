

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

async function pageLoad(){
    try{
        userStatus = await fetchUserStatus();
        toggleFavorite(userStatus)
    } catch(error){
        console.error("Error:", error);
    }
}
pageLoad()