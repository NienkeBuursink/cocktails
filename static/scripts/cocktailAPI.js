const baseURL = "https://www.thecocktaildb.com/api/json/v2/961249867/latest.php";
// const endPoint = "/en/characters";
// const URL = baseURL + endPoint;

console.log(baseURL)

const list = document.querySelector('ul');
const button = document.querySelector('button');

const loader = document.getElementById('loaderDiv');

async function getCharacters() {
	
	loader.classList.add("loading");
	
	const response = await fetch(URL);
    const data = await response.json(); 
    console.log(data);
	const allCharacters = data;
		

	await new Promise((resolve) => setTimeout(resolve, 400));
 
	allCharacters.forEach(function(aCharacter) {
		let characterListElement = 
				`
							<li>
								<h2>${aCharacter.fullName}</h2>
                                <p>${aCharacter.hogwartsHouse}
								<img src="${aCharacter.image}" alt="${aCharacter.fullName}">
							</li>
					`;
		list.insertAdjacentHTML('beforeend', characterListElement);
	})


	loader.classList.remove("loading");
}

button.onclick = getCharacters;