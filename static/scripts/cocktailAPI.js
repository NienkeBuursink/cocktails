const baseURL = "https://www.thecocktaildb.com/api/json/v2/961249867";


const searchCocktailByName = "/search.php?s="; //This endpoint is added to the base url to instagate a search option. The endpoint can change to account for filters
const listByFirstLetter = "/search.php?f=";
const searchIngredientByName = "/search.php?i=";
const lookupCocktailById = "/lookup.php?i=";
const lookupIngredientByID = "lookup.php?iid=";
const oneRandomSearch = "/random.php";
const tenRandomSearch = "/randomselection.php";
const popularCocktails = "/popular.php";
const latestCocktails = "/latest.php";
const searchByIngredient = "/filter.php?i=";
const filterByAlcoholic = "/filter.php?a=";
const list = document.querySelector('ul');



console.log(URL);
async function getCharacters() {
    let userinput = document.getElementById("searchBar").value;
    const URL = baseURL + searchCocktailByName + userinput;
	console.log(userinput);
	const response = await fetch(URL);
    const data = await response.json(); 
    console.log(data.drinks);
    allDrinks = data.drinks;
    allDrinks.forEach(function(aDrink) {
		let drinkList = 
				`
							<li>
								<h2>${aDrink.strDrink}</h2>
                                <p>${aDrink.strInstructions}
								<img src="${aDrink.strDrinkThumb}" alt="${aDrink.strDrink}">
							</li>
					`;
		list.insertAdjacentHTML("beforeend", drinkList);
	})
		
}
const submitButton = document.querySelector("button");
submitButton.onclick = getCharacters;
