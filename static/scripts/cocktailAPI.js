const baseURL = "https://www.thecocktaildb.com/api/json/v2/961249867";
const searchByIngredient = "/filter.php?i=";

const nameList = document.getElementById('cocktailName');
const ingredientList = document.getElementById('cocktailIngredient');
const searchBar = document.getElementById("searchBar");
const submitButton = document.getElementById("searchButton");
const carouselList = document.getElementsByClassName("carousel")
const populairCarouselList = document.querySelector(".popularList");
const latestCarouselList = document.querySelector(".latestList");
const introImg = document.querySelector(".intro img")

let userStatus 
let filteredCocktails
let allPopulairCocktails
let filteredPopulairCocktails
let allLatestCocktails
let filteredLatestCocktails
let allCocktails
async function fetchUserStatus() {
    const response = await fetch('/api/user-status');
    console.log("fetching user status")
    return await response.json();

}
    // Now this fucntion just works for fetching cocktails for the loading of the page.
    // But should i have a different fucntion for each time i need to call the API, for like the populair drink, or latest, or other categories.

    const populairSearch = "/popular.php";
    const latestSearch = "/latest.php";
    const normalSearch = "/search.php?s=";
    const APIArray = [populairSearch, latestSearch, normalSearch];

async function fetchCocktails() {
    
    try {
        const allResults = await Promise.all(APIArray.map(async (option) => {
            let apiUrl = baseURL + option;
            const fullFetch = await fetch(apiUrl);
            return fullFetch.json();
        }));
        [allPopulairCocktails, allLatestCocktails, allCocktails] = allResults;
        
        allPopulairCocktails = allPopulairCocktails.drinks,
        allLatestCocktails = allLatestCocktails.drinks
        allCocktails = allCocktails.drinks

        return { allPopulairCocktails, allLatestCocktails, allCocktails }
        
        
    } catch (error) {
        console.error("Error fetching cocktails:", error);
    }



    // const apiUrl = baseURL + "/search.php?s=";
    // console.log(apiUrl)
    // const nameResponse = await fetch(apiUrl);
    // allCocktails = await nameResponse.json();
    // allCocktails = allCocktails.drinks

    // allPopulairCocktails = 
    // console.log("allcocktails in fetchcocktails: ", allCocktails)
    
        // console.log("when cocktails are fetched, nameData is: ", nameData)
        // console.log("when cocktails are fetched, nameData.drinks is: ", nameData.drinks.slice(0, 100))
    // return searchCocktailArray.drinks;


}


function filterCocktails(allLatestCocktails, allPopulairCocktails, allCocktails, userStatus) {
    
    if (userStatus.isLoggedIn && userStatus.isAdult) {
        // console.log("user logged in and return cocktails")
        // console.log("allcocktails are: ", allCocktails)

        // Show all cocktails for logged-in adults
        filteredPopulairCocktails = allPopulairCocktails
        filteredLatestCocktails = allLatestCocktails
        filteredCocktails = allCocktails

        // console.log("filteredCocktails are: ", filteredCocktails)
        

    } else {
        // console.log("user not logged in and return  filtered cocktails")
        // console.log("allPopulairCocktails are this before filter: ", allPopulairCocktails)

        // Filter out alcoholic drinks for others
        filteredPopulairCocktails = allPopulairCocktails
        filteredLatestCocktails = allLatestCocktails
        filteredCocktails =  allCocktails
        // Need to add .filter to each of these to correctly filter out alcoholic drinks from the alcoholic drinks

        // console.log("filteredPopulairCocktails are this after filter: ", filteredPopulairCocktails)
        // console.log("filteredLatestCocktails are this after filter: ", filteredLatestCocktails)
        // console.log("filteredCocktails are this after filter: ", filteredCocktails)
        return {filteredCocktails, filteredLatestCocktails, filteredPopulairCocktails}
    }
}

// Change the first image to a random cocktail
function introCocktail(filteredCocktails){
    try {
        
        if (filteredCocktails && Array.isArray(filteredCocktails)) {
            const randomIndex = Math.floor(Math.random() * filteredCocktails.length);
            const randomCocktail = filteredCocktails[randomIndex]
            introImg.src = randomCocktail.strDrinkThumb
            introImg.alt = randomCocktail.strDrink
        } else {
            introImg.innerHTML = "<p>Error matching cocktails</p>";
        }
    } catch (error) {
        console.error("showCocktailsOnLoad error:", error);
    }
}

// Showing populair drinks in the first carousel
function showPopulairCocktailsOnLoad (filteredPopulairCocktails){
    console.log(" showCocktialsOnLoad, filteredCocktails are: ",  filteredPopulairCocktails)
    try {
        if (filteredPopulairCocktails && Array.isArray(filteredPopulairCocktails)) {
            filteredPopulairCocktails.forEach(drink => {
                populairCarouselList.insertAdjacentHTML("beforeend", `
                    <li>
                        <a href="/detailPage?id=${drink.idDrink}">
                            <h3>${drink.strDrink}</h2>
                            <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
                        </a>
                        <form action="/toggleFavorite" method="post">
                            <input type="hidden" name="cocktailId" value="${drink.idDrink}">
                            <button class="heartButton" type="submit">
                                <svg viewBox="0 0 65.68 54.33">
                                    <path d="M64.68,17.52c0,2.9-.96,5.29-2.28,7.57-1.74,3.02-4.03,5.66-6.62,7.92l-22.88,19.99L6.8,30.27h0c-1.43-1.39-5.79-7.63-5.79-12.75C1,8.4,8.13,1,16.92,1s15.93,7.4,15.93,16.52c0-9.12,7.12-16.52,15.92-16.52s15.92,7.4,15.92,16.52Z"/>
                                </svg>
                            </button>
                        </form>
                    </li>
                `);
            });
        } else {
            carouselList.innerHTML = "<li>No matching cocktails found</li>";
        }
    } catch (error) {
        console.error("showCocktailsOnLoad error:", error);
        carouselList.innerHTML = "<li>Error loading FilteredList results</li>";
    }
}

// Showing latest drinks in the second carousel
function showLatestCocktailsOnLoad (filteredLatestCocktails){
    console.log(" showCocktialsOnLoad, filteredCocktails are: ",  filteredLatestCocktails)
    try {
        if (filteredLatestCocktails && Array.isArray(filteredLatestCocktails)) {
            filteredLatestCocktails.forEach(drink => {
                latestCarouselList.insertAdjacentHTML("beforeend", `
                    <li>
                        <a href="/detailPage?id=${drink.idDrink}">
                            <h3>${drink.strDrink}</h2>
                            <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
                        </a>
                        <form action="/toggleFavorite" method="post">
                            <input type="hidden" name="cocktailId" value="${drink.idDrink}">
                            <button class="heartButton" type="submit">
                                <svg viewBox="0 0 65.68 54.33">
                                    <path d="M64.68,17.52c0,2.9-.96,5.29-2.28,7.57-1.74,3.02-4.03,5.66-6.62,7.92l-22.88,19.99L6.8,30.27h0c-1.43-1.39-5.79-7.63-5.79-12.75C1,8.4,8.13,1,16.92,1s15.93,7.4,15.93,16.52c0-9.12,7.12-16.52,15.92-16.52s15.92,7.4,15.92,16.52Z"/>
                                </svg>
                            </button>
                        </form>
                    </li>
                `);
            });
        } else {
            carouselList.innerHTML = "<li>No matching cocktails found</li>";
        }
    } catch (error) {
        console.error("showCocktailsOnLoad error:", error);
        carouselList.innerHTML = "<li>Error loading FilteredList results</li>";
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
