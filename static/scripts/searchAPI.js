

async function fetchUserStatus() {
    const response = await fetch('/api/user-status');
    console.log("fetching user status")
    return await response.json();

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
    const searchURL = baseURL + "/search.php?s=" + userInput;
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
                        <a href="/detailPage?id=${drink.idDrink}">
                            <h2>${drink.strDrink}</h2>
                            <p>${drink.strAlcoholic}</p>
                            <p>${drink.strGlass}</p>
                            <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
                        </a>
                        <form action="/toggleFavorite" method="post">
                            <input type="hidden" name="cocktailId" value="${drink.idDrink}">
                            <button class="heartButton" type="submit">toggle to Favorites</button>
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


async function pageLoad() {
    try {
        userStatus = await fetchUserStatus();
        await fetchCocktails()
        // displayCocktails(cocktails);
        console.log(userStatus, ":userstatus")
        console.log(allCocktails, "searchCocktailArray")

        await filterCocktails(allLatestCocktails, allPopulairCocktails, allCocktails, userStatus);
        
        console.log(filteredCocktails, filteredLatestCocktails, filteredPopulairCocktails, "pageLoad  filtered cocktails")

        showPopulairCocktailsOnLoad(filteredPopulairCocktails)
        showLatestCocktailsOnLoad(filteredLatestCocktails)
        introCocktail(filteredCocktails)

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
