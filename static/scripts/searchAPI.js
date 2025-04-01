const baseURL = "https://www.thecocktaildb.com/api/json/v2/961249867";
const submitButton = document.getElementById("searchButton");
const searchBar = document.getElementById("searchBar");
const nameList = document.getElementById('cocktailName');
const normalSearch = "/search.php?s=";
let sortSetting = document.querySelector(".sort span");
let userStatus;
let filteredNameData;
let allCocktails;

async function fetchUserStatus() {
    const response = await fetch('/api/user-status');
    console.log("fetching user status")
    return await response.json();
}

async function fetchCocktails() {
    try{
        const userInput = searchBar.value.trim(); 

        let apiUrl = baseURL + normalSearch + userInput; 

        const response = await fetch(apiUrl); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allCocktails = await response.json(); 
        allCocktails = allCocktails.drinks

        return allCocktails; 

    } catch(error){
        console.error("Error fetching cocktails", error)
    }
}

async function filterCocktailsByAge(allCocktails, userStatus) {
    console.log(userStatus)
    if (userStatus.isLoggedIn && userStatus.isAdult) {
        // Show all cocktails for logged-in adults
        filteredCocktails = allCocktails
        console.log(filteredCocktails)
    } else {
        console.log(allCocktails)
        filteredCocktails =  allCocktails.filter(cocktail => cocktail.strAlcoholic === "Non alcoholic");
        console.log(filteredCocktails)
        return {filteredCocktails}
    }
}


async function sorting(){

    if (sortSetting.textContent == "Name"){
        filteredCocktails = [...filteredCocktails].sort((a, b) => a.strDrink.localeCompare(b.strDrink));
        console.log(filteredCocktails, "name")
        return {filteredCocktails}
    } else if (sortSetting.textContent == "Latest"){
        filteredCocktails = [...filteredCocktails].sort((a, b) => new Date(b.dateModified) - new Date(a.dateModified));
        console.log(filteredCocktails, "date")
        return {filteredCocktails}
    }
}


async function appliedFilters(){
    try{
        const alcoholicFilter = document.querySelector(".alcoholicFilter")
        const glassFilter = document.querySelector(".glassFilter");
        const categoryFilter = document.querySelector(".categoryFilter");
        console.log(userStatus)

        if(userStatus.isLoggedIn && userStatus.isAdult){
            alcoholicFilter.classList.remove("disabled");
        } else{
            alcoholicFilter.classList.add("disabled")
        }

        const selectedAlcoholicFilter = getCheckedValues(alcoholicFilter);
        const selectedGlassTypes = getCheckedValues(glassFilter);
        const selectedCategories = getCheckedValues(categoryFilter);

        console.log(selectedGlassTypes, " selected glass types")

        filteredCocktails = filteredCocktails.filter((cocktail) => {
            const matchesAlcoholicFilter = 
                selectedAlcoholicFilter.length === 0 || selectedAlcoholicFilter.includes(cocktail.strAlcoholic)
            const matchesGlassType =
                selectedGlassTypes.length === 0 || selectedGlassTypes.includes(cocktail.strGlass);
            const matchesCategory =
                selectedCategories.length === 0 || selectedCategories.includes(cocktail.strCategory);
                console.log("matches glass type Results:", matchesGlassType);
            
            return matchesGlassType && matchesCategory && matchesAlcoholicFilter;
        });

        console.log("Filtered Results:", filteredCocktails);

        // Update the display with filtered results
        displayCocktails(filteredCocktails);

    }catch (error) {
        console.error("Error adding appliedfiltering:", error);
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
    //     // filteredCocktails = filteredNameData
    // }
    // // displayCocktails(filteredCocktails);
    // // not sure if this code above is needed.

}

function getCheckedValues(fieldset) {
    const checkboxes = fieldset.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map((checkbox) => checkbox.id); // Return an array of checked checkbox IDs
}

async function displayCocktails(){    
    try {
        nameList.innerHTML = ""
        const summarySpan = document.querySelector('.filter summary span'); // Select the span inside the summary
        if (summarySpan) {
            summarySpan.textContent = "(" + filteredCocktails.length + " items)"; // Update the text content
        }
        if (filteredCocktails && Array.isArray(filteredCocktails)) {
            console.log("filteredCocktails in making", filteredCocktails)
            filteredCocktails.forEach(drink => {
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
        await filterCocktailsByAge(allCocktails, userStatus)
        await sorting(filteredCocktails)
        await appliedFilters(userStatus, filteredCocktails)
        console.log(filteredCocktails, "after sorting")
        await displayCocktails(filteredCocktails)
    } catch (error) {
        console.error("Error:", error);
    }
}

pageLoad();

// Event listeners
const sortButtons = document.querySelectorAll(".sort label")

submitButton.addEventListener("click", async ()  => {
    await fetchCocktails();
    await filterCocktailsByAge(allCocktails, userStatus)
    await sorting()
    await appliedFilters(userStatus, filteredCocktails)
    await displayCocktails(filteredCocktails);

}
);
sortButtons.forEach( (button)  =>  {
    // Add an event listener to each button
    button.addEventListener("click",async () => {
        
      // Set sortSetting's text content to the clicked button's text content
      sortSetting.textContent = button.textContent;
      await fetchCocktails();
      await filterCocktailsByAge(allCocktails, userStatus)
      await sorting()
      await appliedFilters(userStatus, filteredCocktails)
      displayCocktails(filteredCocktails);


    });
  });

filterButtons = document.querySelectorAll(".filter input")
  filterButtons.forEach((button) => {
    // Add an event listener to each button
    button.addEventListener("click", async () => {
      // Set sortSetting's text content to the clicked button's text content
      await fetchCocktails();
      await filterCocktailsByAge(allCocktails, userStatus)
      await sorting()
      await appliedFilters(userStatus, filteredCocktails)
      displayCocktails(filteredCocktails);

    });
  });


searchBar.addEventListener("keypress", (e) => {
    if (e.key === "Enter");
});
