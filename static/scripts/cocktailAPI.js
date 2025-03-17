const baseURL = "https://www.thecocktaildb.com/api/json/v2/961249867";
const searchCocktailByName = "/search.php?s=";
const listByFirstLetter = "/search.php?f=";
const searchByIngredient = "/filter.php?i=";
// const searchIngredientByName = "/search.php?i=";
// const lookupCocktailById = "/lookup.php?i=";
// const lookupIngredientByID = "lookup.php?iid=";
// const oneRandomSearch = "/random.php";
// const tenRandomSearch = "/randomselection.php";
// const popularCocktails = "/popular.php";
// const latestCocktails = "/latest.php";
// const filterByAlcoholic = "/filter.php?a=";

const nameList = document.getElementById('cocktailName');
const ingredientList = document.getElementById('cocktailIngredient');
const searchBar = document.getElementById("searchBar");
const submitButton = document.getElementById("searchButton");

async function getCocktails() {
    // Clear previous results
    nameList.innerHTML = "";
    ingredientList.innerHTML = "";

    // Get and validate input
    const userInput = searchBar.value.trim();
    if (!userInput) {
        nameList.innerHTML = "<li>Please enter a search term</li>";
        return;
    }
    
    // Build URLs based on search type
    let nameURL = "";
    let ingredientURL = "";

    if (userInput.length === 1) {
		// Single letter search (name only)
		nameURL = baseURL + listByFirstLetter + userInput;
		ingredientURL = ""; // No ingredient search for single letters
		} else {
		// Search both name and ingredient
		nameURL = baseURL + searchCocktailByName + userInput;
		ingredientURL = baseURL + searchByIngredient + userInput;
	}

    // search by name
    try {
        const nameResponse = await fetch(nameURL);
        const nameData = await nameResponse.json();
        
        if (nameData.drinks && Array.isArray(nameData.drinks)) {
            nameData.drinks.forEach(drink => {
                nameList.insertAdjacentHTML("beforeend", `
                    <li>
                        <h2>${drink.strDrink}</h2>
                        <p>${drink.strInstructions}</p>
                        <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
                        <form action="/addFavorite" method="post">
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

    // ingredient search
    if (userInput.length > 1) {
        try {
            const ingredientResponse = await fetch(ingredientURL);
            const ingredientData = await ingredientResponse.json();
            
            if (ingredientData.drinks && Array.isArray(ingredientData.drinks)) {
                ingredientData.drinks.forEach(drink => {
                    ingredientList.insertAdjacentHTML("beforeend", `
                        <li>
                            <h2>${drink.strDrink}</h2>
                            <p>${drink.strInstructions}</p>
                            <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
                            <form action="/addFavorite" method="post">
                                <input type="hidden" name="cocktailId" value="${drink.idDrink}">  <!-- CORRECT! -->
                                <button type="submit">Add to Favorites</button>
                            </form>
                        </li>
                    `);
                }); // ^ <p> says undefined, still have to figure that one out
            } else {
                ingredientList.innerHTML = "<li>No cocktails with this ingredient</li>";
            }
        } catch (error) {
            console.error("Ingredient search error:", error);
            ingredientList.innerHTML = "<li>Error loading ingredient results</li>";
        }
    }
}

// Event listeners
submitButton.addEventListener('click', getCocktails);
searchBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getCocktails();
});
