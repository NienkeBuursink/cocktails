const baseURL = "https://www.thecocktaildb.com/api/json/v2/961249867";
const submitButton = document.getElementById("searchButton");
const searchBar = document.getElementById("searchBar");
const nameList = document.getElementById('cocktailName');
let sortSetting = document.querySelector(".sort span")

let userStatus 
let filteredNameData
let filteredNameData2
async function fetchUserStatus() {
    const response = await fetch('/api/user-status');
    console.log("fetching user status")
    return await response.json();

}


async function SearchCocktails(userStatus){

    // Clear previous results
    nameList.innerHTML = "";
    // ingredientList.innerHTML = "";

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
    // if (!userInput) {
    //     nameList.innerHTML = "<li>Please enter a search term</li>";
    //     return;
    // }
    const searchURL = baseURL + "/search.php?s=" + userInput;
    console.log(searchURL)
    const nameResponse = await fetch(searchURL);
    const nameData = await nameResponse.json();
    
    console.log(nameData)
    console.log(userStatus, ":userstatus")
    console.log(userStatus.isLoggedIn, ":userstatus.isLoggedIn")


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



    // Sorting and filtering

    if (sortSetting.textContent == "Name"){
        filteredNameData = [...filteredNameData].sort((a, b) => a.strDrink.localeCompare(b.strDrink));
        console.log(sortSetting.textContent, "name")
    } else if (sortSetting.textContent == "Latest"){
        filteredNameData = [...filteredNameData].sort((a, b) => new Date(b.dateModified) - new Date(a.dateModified));
        console.log(sortSetting.textContent, "date")
    }
    // if ( 1 === 1){

    //     document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
    //         checkbox.addEventListener("change", (filta) => {
    //             console.log(filta)
    //         console.log(filta.target.id)
    //         console.log(filteredNameData, "before")
    //         filteredNameData2 = filteredNameData.filter(cocktail => cocktail.strAlcoholic === filta.target.id);
    //         console.log(filteredNameData2, "after")
    //     });
    // }) } else{
    //     console.log("kaas")
    //     filteredNameData2 = filteredNameData
    // }
    

    

    try {
        const summarySpan = document.querySelector('.filter summary span'); // Select the span inside the summary
        if (summarySpan) {
            summarySpan.textContent = "(" + filteredNameData.length + " items)"; // Update the text content
        }
    
        if (filteredNameData && Array.isArray(filteredNameData)) {
            filteredNameData.forEach(drink => {
                nameList.insertAdjacentHTML("beforeend", `
                    <li>
                        <a href="/detailPage?id=${drink.idDrink}">
                            <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
                            <div>
                                <h2>${drink.strDrink}</h2>
                                <p>${drink.strAlcoholic}</p>
                                <p>${drink.strGlass}</p>
                            </div>
                        </a>
                        <form action="/toggleFavorite" method="post">
                            <input type="hidden" name="cocktailId" value="${drink.idDrink}">
                            <button class="heartButton" type="submit">toggle to Favorites</button>
                        </form>
                    </li>
            `);
        return filteredNameData2    
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

        console.log(userStatus, ":userstatus")


        SearchCocktails(userStatus)



    } catch (error) {
        console.error("Error:", error);
    }
}

pageLoad();

// Event listeners
const sortButtons = document.querySelectorAll(".sort label")

submitButton.addEventListener("click", () => {
    SearchCocktails(userStatus);
// SearchCocktails(userStatus)
}
);
sortButtons.forEach((button) => {
    // Add an event listener to each button
    button.addEventListener("click", () => {
      // Set sortSetting's text content to the clicked button's text content
      sortSetting.textContent = button.textContent;
      SearchCocktails(userStatus);
      return sortSetting
    });
  });

filterButtons = document.querySelectorAll(".filter label")
  filterButtons.forEach((button) => {
    // Add an event listener to each button
    button.addEventListener("click", () => {
      // Set sortSetting's text content to the clicked button's text content
      SearchCocktails(userStatus);
    });
  });


searchBar.addEventListener("keypress", (e) => {
    if (e.key === "Enter");
});
