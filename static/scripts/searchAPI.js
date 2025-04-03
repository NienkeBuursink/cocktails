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
        console.log(userStatus);

        if(userStatus.isLoggedIn && userStatus.isAdult){
            alcoholicFilter.classList.remove("disabled");
        } else{
            alcoholicFilter.classList.add("disabled");
            const nonAlcoholicCheckbox = document.getElementById("Non alcoholic");
            const logInMessage = document.querySelector(".logInMessage");
            logInMessage.classList.remove("none");
            nonAlcoholicCheckbox.checked = true;
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
                <li class="list-item hidden">
                <a href="/detailPage?id=${drink.idDrink}">
                    <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
                    <div>
                        <h3>${drink.strDrink}</h3>
                        <p>${drink.strCategory}</p>
                        <p>${drink.strGlass}</p>
                    </div>
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

            nameList.innerHTML = "<li>No matching cocktails found</li>";
        }
    } catch (error) {
        console.error("Name search error:", error);
        nameList.innerHTML = "<li>Error loading name results</li>";
    }

}

async function intersectionObser() {
    const listItems = document.querySelectorAll(".list-item");
    const observerOptions = {
      root: null, // Observe relative to the viewport
      threshold: 0.4, // Trigger when 10% of the item is visible
    };
    const observerCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          entry.target.classList.remove("hidden");
          observer.unobserve(entry.target); // Stop observing once animated
        }
      });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    listItems.forEach((item) => {
      observer.observe(item);
    });
  };

  async function toggleFavorite(userStatus) {
    const everyListItem = document.querySelectorAll("li");  
    everyListItem.forEach((listItem) => {
      const h3Element = listItem.querySelector("h3");
      if (!h3Element) return;
      const drinkName = h3Element.textContent.trim();
      if (userStatus.favoritedDrinks.includes(drinkName)) {
        const favoritedButton = listItem.querySelector(".heartButton");
        favoritedButton.classList.toggle("favourited");
      }
    });
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
        toggleFavorite(userStatus)
        intersectionObser()
    } catch (error) {
        console.error("Error:", error);
    }
}

pageLoad();

// Event listeners
const sortButtons = document.querySelectorAll(".sort label")

submitButton.addEventListener("click", async ()  => {
    pageLoad()
}
);
sortButtons.forEach( (button)  =>  {
    // Add an event listener to each button
    button.addEventListener("click",async () => {    
      // Set sortSetting's text content to the clicked button's text content
      sortSetting.textContent = button.textContent;
      pageLoad()
    });
  });

filterButtons = document.querySelectorAll(".filter input")
  filterButtons.forEach((button) => {
    // Add an event listener to each button
    button.addEventListener("click", async () => {
      // Set sortSetting's text content to the clicked button's text content
      pageLoad()
    });
  });


searchBar.addEventListener("keypress", (e) => {
    if (e.key === "Enter");
});

