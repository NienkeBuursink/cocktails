// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Setup
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const baseURL = "https://www.thecocktaildb.com/api/json/v2/961249867";
const carouselList = document.getElementsByClassName("carousel")
const populairCarouselList = document.querySelector(".popularList");
const latestCarouselList = document.querySelector(".latestList");
const cocoaCarouselList = document.querySelector(".cocoaList");
const coffeeCarouselList = document.querySelector(".coffeeList");
const introImg = document.querySelector(".intro img")
const populairSearch = "/popular.php";
const latestSearch = "/latest.php";
const normalSearch = "/search.php?s=";
const APIArray = [populairSearch, latestSearch, normalSearch];

let userStatus 
let filteredCocktails
let allPopulairCocktails
let filteredPopulairCocktails
let allLatestCocktails
let filteredLatestCocktails
let allCocktails
let filteredCocoaCocktails
let filteredCoffeeCocktails
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Functions
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// Fetching Userstatus from server
async function fetchUserStatus() {
    const response = await fetch('/api/user-status');
    console.log("fetching user status")
    return await response.json();
}

// Fetching Cocktails from the API
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
}

// Filtering between alcoholic and non alcoholic drinks based on userStatus
// Result of this function is an array of drinks called "filteredCocktails" 
function filterCocktails(allLatestCocktails, allPopulairCocktails, allCocktails, userStatus) {
    
    if (userStatus.isLoggedIn && userStatus.isAdult) {
        // console.log("user logged in and return cocktails")
        // console.log("allcocktails are: ", allCocktails)

        // Show all cocktails for logged-in adults
        filteredPopulairCocktails = allPopulairCocktails
        filteredLatestCocktails = allLatestCocktails
        filteredCocktails = allCocktails
        filteredCocoaCocktails = filteredCocktails.filter(cocktail => cocktail.strCategory === "Cocoa")
        filteredCoffeeCocktails = filteredCocktails.filter(cocktail => cocktail.strCategory === "Coffee / Tea")

        // console.log("filteredCocktails are: ", filteredCocktails)
        

    } else {
        // console.log("user not logged in and return  filtered cocktails")
        // console.log("allPopulairCocktails are this before filter: ", allPopulairCocktails)

        // Filter out alcoholic drinks for others
        filteredPopulairCocktails = allPopulairCocktails      
        filteredCocktails =  allCocktails.filter(cocktail => cocktail.strAlcoholic === "Non alcoholic");
        filteredLatestCocktails = [...filteredCocktails]
        .sort((a, b) => new Date(b.dateModified) - new Date(a.dateModified))
        .slice(0, 10);
        filteredCocoaCocktails = filteredCocktails.filter(cocktail => cocktail.strCategory === "Cocoa")
        filteredCoffeeCocktails = filteredCocktails.filter(cocktail => cocktail.strCategory === "Coffee / Tea")
        console.log(filteredCocktails, "filtered cocktials and, fioltered cocoa", filteredCocoaCocktails)
        // Need to add .filter to each of these to correctly filter out alcoholic drinks from the alcoholic drinks

        // console.log("filteredPopulairCocktails are this after filter: ", filteredPopulairCocktails)
        // console.log("filteredLatestCocktails are this after filter: ", filteredLatestCocktails)
        // console.log("filteredCocktails are this after filter: ", filteredCocktails)
        return {filteredCocktails, filteredLatestCocktails, filteredPopulairCocktails, filteredCocoaCocktails}
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

    let drinkCountSpan = document.querySelector('.popularCarousel span'); // Select the span inside the summary
    if (drinkCountSpan) {
        drinkCountSpan.textContent = "(" + filteredPopulairCocktails.length + " items)"; // Update the text content
    }
    try {
        if (filteredPopulairCocktails && Array.isArray(filteredPopulairCocktails)) {
            filteredPopulairCocktails.forEach(drink => {
                populairCarouselList.insertAdjacentHTML("beforeend", `
                    <li>
                        <a href="/detailPage?id=${drink.idDrink}">
                            <h3>${drink.strDrink}</h3>
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
            if (!userStatus.isLoggedIn) {
                populairCarouselList.insertAdjacentHTML("beforebegin", `
                    <div class="loginOverlay">
                        <p>Sign in to access all features!</p>
                        <a href="/login" class="login-button">Sign In</a>
                    </div>
                `);
            }
            if (userStatus.isLoggedIn && !userStatus.isAdult) {
                populairCarouselList.insertAdjacentHTML("beforebegin", `
                    <div class="loginOverlay">
                        <p>You must be 18+ to see these cocktails :')</p>
                    </div>
                `);
            }
        } else {
            // Show fallback message if no cocktails are available
            populairCarouselList.innerHTML = "<li>No matching cocktails found</li>";
        }
    } catch (error) {
        console.error("showCocktailsOnLoad error:", error);
        carouselList.innerHTML = "<li>Error loading FilteredList results</li>";
    }
}

// Showing latest drinks in the second carousel
function showLatestCocktailsOnLoad (filteredLatestCocktails){
    console.log(" showCocktialsOnLoad, filteredCocktails are: ",  filteredLatestCocktails)

    let drinkCountSpan = document.querySelector('.latestCarousel span'); // Select the span inside the summary
    if (drinkCountSpan) {
        drinkCountSpan.textContent = "(" + filteredLatestCocktails.length + " items)"; // Update the text content
    }
    try {
        if (filteredLatestCocktails && Array.isArray(filteredLatestCocktails)) {
            filteredLatestCocktails.forEach(drink => {
                latestCarouselList.insertAdjacentHTML("beforeend", `
                    <li>
                        <a href="/detailPage?id=${drink.idDrink}">
                            <h3>${drink.strDrink}</h3>
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

function showCocoaCocktailsOnLoad (filteredCocoaCocktails){
    console.log(" showCocktialsOnLoad, filteredCocktails are: ",  filteredCocoaCocktails)

    let drinkCountSpan = document.querySelector('.cocoaCarousel span'); // Select the span inside the summary
    if (drinkCountSpan) {
        drinkCountSpan.textContent = "(" + filteredCocoaCocktails.length + " items)"; // Update the text content
    }
    try {
        if (filteredCocoaCocktails && Array.isArray(filteredCocoaCocktails)) {
            filteredCocoaCocktails.forEach(drink => {
                cocoaCarouselList.insertAdjacentHTML("beforeend", `
                    <li>
                        <a href="/detailPage?id=${drink.idDrink}">
                            <h3>${drink.strDrink}</h3>
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

function showCoffeeCocktailsOnLoad (filteredCoffeeCocktails){
    console.log(" showCocktialsOnLoad, filteredCocktails are: ",  filteredCoffeeCocktails)
    
    let drinkCountSpan = document.querySelector('.coffeeCarousel span'); // Select the span inside the summary
    if (drinkCountSpan) {
        drinkCountSpan.textContent = "(" + filteredCoffeeCocktails.length + " items)"; // Update the text content
    }


    try {
        if (filteredCoffeeCocktails && Array.isArray(filteredCoffeeCocktails)) {
            filteredCoffeeCocktails.forEach(drink => {
                coffeeCarouselList.insertAdjacentHTML("beforeend", `
                    <li>
                        <a href="/detailPage?id=${drink.idDrink}">
                            <h3>${drink.strDrink}</h3>
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

async function toggleFavorite(userStatus) {
    if(userStatus.isLoggedIn){
    const everyListItem = document.querySelectorAll("li");  
    everyListItem.forEach((listItem) => {
      const h3Element = listItem.querySelector("h3");
      if (!h3Element) return;
      const drinkName = h3Element.textContent.trim();
      if (userStatus.favoritedDrinks.includes(drinkName)) {
        const favoritedButton = listItem.querySelector(".heartButton");
        favoritedButton.classList.toggle("favourited");
      } });
    } else{
        return
    }
}

async function pageLoad() {
    try {
        userStatus = await fetchUserStatus();
        await fetchCocktails();
        await filterCocktails(allLatestCocktails, allPopulairCocktails, allCocktails, userStatus);
        showPopulairCocktailsOnLoad(filteredPopulairCocktails)
        showLatestCocktailsOnLoad(filteredLatestCocktails)
        showCocoaCocktailsOnLoad(filteredCocoaCocktails)
        showCoffeeCocktailsOnLoad(filteredCoffeeCocktails)
        introCocktail(filteredCocktails)
        toggleFavorite(userStatus)

    } catch (error) {
        console.error("Error:", error);
    }
}

pageLoad();