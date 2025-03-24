
const baseURL = "https://www.thecocktaildb.com/api/json/v2/961249867";
const searchByIngredient = "/filter.php?i=";

const nameList = document.getElementById('cocktailName');
const ingredientList = document.getElementById('cocktailIngredient');
const searchBar = document.getElementById("searchBar");
const submitButton = document.getElementById("searchButton");


async function fetchUserStatus() {
    const response = await fetch('/api/user-status');
    console.log("fetching user status")
    return await response.json();

}


async function fetchCocktails() {

    // if (userStatus.isLoggedIn && userStatus.isAdult) {
    //     apiUrl = `${baseURL}/search.php?s=a`;
    //     console.log("someone is adult");
    // } else {
    //     apiUrl = `${baseURL}/filter.php?a=Non_Alcoholic`;
    //     console.log("not logged in or no adult");
    // }


    const apiUrl = `${baseURL}/search.php?s=`;
    console.log(apiUrl)
    const nameResponse = await fetch(apiUrl);
    const nameData = await nameResponse.json();
    
    return nameData.drinks;


}

function filterCocktails(cocktails, userStatus) {
    
    if (userStatus.isLoggedIn && userStatus.isAdult) {
        // Show all cocktails for logged-in adults
        console.log("user logged in and return cocktails")
        return cocktails;
        

    } else {
        console.log("user not logged in and return  filtered cocktails")
        // Filter out alcoholic drinks for others
        return cocktails.filter(cocktail => cocktail.strAlcoholic === "Non alcoholic");
    }
}

async function SearchCocktails(userStatus){

    // Clear previous results
    nameList.innerHTML = "";
    ingredientList.innerHTML = "";

    // Get and validate input

    // // Build URLs based on search type
    // let ingredientURL = "";

    // if (userInput.length === 1) {
	// 	// Single letter search (name only)
	// 	ingredientURL = ""; // No ingredient search for single letters
	// 	} else {
	// 	// Search both name and ingredient
	// 	ingredientURL = baseURL + searchByIngredient + userInput;
	// }

    const userInput = searchBar.value.trim();
    if (!userInput) {
        nameList.innerHTML = "<li>Please enter a search term</li>";
        return;
    }
    const searchURL = `${baseURL}/search.php?s=${userInput}`;
    console.log(searchURL)
    const nameResponse = await fetch(searchURL);
    const nameData = await nameResponse.json();
    
    console.log(nameData)
    console.log(userStatus, ":userstatus")
    console.log(userStatus.isLoggedIn, ":userstatus.isLoggedIn")
    let filteredNameData
    if (userStatus.isLoggedIn && userStatus.isAdult) {
        // Show all cocktails for logged-in adults
        console.log("user logged in and return cocktails")
        filteredNameData = nameData.drinks
        
    } else {
        console.log("user not logged in and return  filtered cocktails")
        // Filter out alcoholic drinks for others
        console.log(nameData.drinks, "before the filter")
        filteredNameData =  nameData.drinks.filter(cocktail => cocktail.strAlcoholic === "Non alcoholic");
        console.log(filteredNameData, "after the filter")
    }

    try {
        
        if (filteredNameData && Array.isArray(filteredNameData)) {
            filteredNameData.forEach(drink => {
                nameList.insertAdjacentHTML("beforeend", `
                    <li>
                        <h2>${drink.strDrink}</h2>
                        <p>${drink.strInstructions}</p>
                        <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
                        <form action="/toggleFavorite" method="post">
                            <input type="hidden" name="cocktailId" value="${drink.idDrink}">  <!-- CORRECT! -->
                            <button type="submit">Add to Favorites</button>
                        </form>
                    </li>
            `);
            });
        } else {

            nameList.innerHTML = "<li>No matching cocktails found</li>";
        }
    } catch (error) {
        console.error("Name search error:", error);
        nameList.innerHTML = "<li>Error loading name results</li>";
    }

}

let userStatus 
let filteredCocktails
async function pageLoad() {
    try {
        userStatus = await fetchUserStatus();
        // displayCocktails(cocktails);
        console.log(userStatus, ":userstatus")
        const allCocktails = await fetchCocktails(userStatus);
        filteredCocktails = filterCocktails(allCocktails, userStatus);
        // getCocktails(filteredCocktails);
        // getCocktail will have to be replaced with a function that loads teh cocktials when entering the first page

        SearchCocktails(userStatus)

    } catch (error) {
        console.error("Error:", error);
    }
}

pageLoad();


// Event listeners
submitButton.addEventListener('click', () => SearchCocktails(userStatus));
searchBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter');
});
