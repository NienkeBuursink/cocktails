const baseURL = "https://www.thecocktaildb.com/api/json/v2/961249867";


const searchCocktailByName = "/search.php?s="; //This endpoint is added to the base url to instagate a search option. The endpoint can change to account for filters
const listByFirstLetter = "/search.php?f=";
const searchIngredientByName = "/search.php?i=";
const lookupCocktailById = "/lookup.php?i=";
const lookupIngredientByID = "lookup.php?iid=";
const oneRandomSearch = "/random.php"
const tenRandomSearch = "/randomselection.php"
const popularCocktails = "/popular.php"
const latestCocktails = "/latest.php"
const searchByIngredient = "/filter.php?i="
const filterByAlcoholic = "/filter.php?a="


const userinput = "marga" //This is the users input from the html to get search options.
const URL = baseURL + endPoint + userinput;

console.log(URL)

async function getCharacters() {
	
	const response = await fetch(URL);
    const data = await response.json(); 
    console.log(data);
    // allDrinks = data
    // allDrinks.forEach(function(aDrink) {
	// 	let drinkList = 
	// 			`
	// 						<li>
	// 							<h2>${aDrink.strDrink}</h2>
    //                             <p>${aDrink.strInstructions}
	// 							<img src="${aDrink.strImageSource}" alt="${aDrink.strDrink}">
	// 						</li>
	// 				`;
	// 	list.insertAdjacentHTML('beforeend', characterListElement);
	// })


		
}

getCharacters()

