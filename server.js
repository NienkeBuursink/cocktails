// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Setup
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
require("dotenv").config();
const xss = require("xss");
xss('<script>alert("xss");</script>');
const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session")
const { MongoClient } = require("mongodb");
const validator = require("validator");
const app = express();

const uri = process.env.URI;
const client = new MongoClient(uri);
const db = client.db(process.env.DB_NAME);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use("/static", express.static("static"));



// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Run MongoDB
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
async function run() {
  // console.log("running...")
  try {
    await client.connect();
    // database and collection code goes here
    // find code goes here
    // iterate code goes here
    // console.log("connected to database.");
  } catch(error) {
    console.log(error);
    // Ensures that the client will close when you finish/error
  }
}
run();



// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Session
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET ,
  cookie: { secure: process.env.NODE_ENV === "production" },
  // Resave is for not resaving the session when nothing changes
  // SaveUninitialized is for saving each NEW session, even when nothing has changed
  // Dont forget to add the SESSION_SECRET to your own .env file
  cookie: { maxAge: 600000 },
  rolling: true
  // Cookie age set to 600000 (10minutes.) 
  // rolling means that each time the user interact with the server the cookie timer resets.
  
  
}))

const checkingIfUserIsLoggedIn = (req, res, next) => {
  // console.log("Middleware called");
  // console.log("Session:", req.session);
  // console.log("UserLoggedIn:", req.session.userLoggedIn);
  
  if (req.session.userLoggedIn) {
    console.log("User is logged in");
    next();
  } else {
    console.log("User is not logged in, redirecting");
    res.redirect("/login"); 
    // If you try to go to the account page you'll be redirected to the login page
  }
};



// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Routes
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
app.get("/", onHome);
app.get("/signup", signUp);
app.post("/signup", signedUp);
app.get("/login", logIn);
app.post("/login", loggedIn);
app.get("/logout", logOut);
app.get("/detailpage", detailPage);
app.get("/account", checkingIfUserIsLoggedIn, showProfile);
app.post("/toggleFavorite", toggleFavorite);
app.get("/search", search)

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// basic functions
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function onHome(req, res){
  try {
    res.render("pages/index.ejs"); //pages has to be added to search for the index file as it is in a seperate folder 
  } catch (error) {
    console.log(error);
  }
}

function logIn(req, res){
  try {
    // console.log(req.body);
    res.render("pages/logIn");
  } catch (error) {
    console.log(error);
  }
}

function signUp(req, res){
  try {
    // console.log(req.body);
    res.render("pages/signUp");
  } catch (error) {
    console.log(error);
  }
}
function search(req, res){
  try{
    res.render("pages/search");
  } catch(error){
    console.log(error);
  }
}

function logOut(req, res) {
  try {
    req.session.userLoggedIn = false;
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
}



// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// signing up with bcrypt
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
async function signedUp(req, res) { // function when submitted form
  try {
    // Destructure form to use password for hashing and separate the rest
    const { email, username, userPassword, birthday } = req.body;
    // console.log(req.body);

    // Validate inputs
    if (!validator.isLength(username, { min: 3, max: 20 })) {
      return res.status(400).json({ error: "Username must be between 3 and 20 characters" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    if (!validator.isStrongPassword(userPassword, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })) {
      return res.status(400).json({ error: "Password does not meet the criteria" });
    }
    if (!validator.isDate(birthday)) {
      return res.status(400).json({ error: "Date is invalid" });
    }
    

    // hashing
    console.time("hash");
    const hash = await bcrypt.hash(userPassword, 13);
    console.timeEnd("hash");

    console.log("username:", username);
    console.log("email:", email);
    console.log("hashed password:", hash);
    console.log("date of birth:", birthday);


    // Create a new user for mongodb
    const newUser = {
      username,
      email,
      birthday,
      password: hash,
      favorites: [] // add empty array to store cocktail ids
    };

    // Insert the new user into the database
    const collection = db.collection("users");
    await collection.insertOne(newUser);

    let query
    const user = await collection.findOne(query);

      req.session.userLoggedIn = true;
      req.session.username = user.username;
      req.session.age = new Date(user.birthday);
      let today = new Date()
      let age = today.getFullYear() -  req.session.age.getFullYear();
      const monthDiff = today.getMonth() -  req.session.age.getMonth()

      if(monthDiff < 0 || (monthDiff === 0 && today.getDate() <  req.session.age.getDate())){
        console.log("above age")
        age--
        console.log(age)
        
      } else{
        console.log("under kees")
        console.log(age)
      }
    
      req.session.age = age
      console.log("req.session.age = ", age)
      //
      
      console.log("User logged in:", user.birthday )
      // logged in
      // console.log("User logged in:", user.username );
      // res.status(200).json({ message: "Login successful", username: user.username });
      return res.json({ message: "Signup successful, redirecting", redirect: "/account" });
    
  } catch (error) {
    console.error(error);
  }
}



// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// logging in with bcrypt
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
async function loggedIn(req, res) {
  
  try {
    const { nameOrMail, userPassword } = req.body;

    // Determine if the input is an email or username
    let query;
    if (validator.isEmail(nameOrMail)) {
      query = { email: nameOrMail }; // Search by email
    } else {
      query = { username: nameOrMail }; // Search by username
    }


    // find user in database
    const collection = db.collection("users");
    const user = await collection.findOne(query);

    // check if user exists
    if (!user) {
      return res.status(401).json({ error: "username or password does not match" });
    }

    // compare passwords
    const isMatch = await bcrypt.compare(userPassword, user.password);
    // console.log(isMatch);
    if (isMatch) {
      req.session.userLoggedIn = true;
      req.session.username = user.username;
      req.session.age = new Date(user.birthday);
      let today = new Date()
      let age = today.getFullYear() -  req.session.age.getFullYear();
      const monthDiff = today.getMonth() -  req.session.age.getMonth()

      if(monthDiff < 0 || (monthDiff === 0 && today.getDate() <  req.session.age.getDate())){
        console.log("above age")
        age--
        console.log(age)
        
      } else{
        console.log("under kees")
        console.log(age)
      }
    
      req.session.age = age
      console.log("req.session.age = ", age)
      //
      
      console.log("User logged in:", user.birthday )
      // logged in
      // console.log("User logged in:", user.username );
      // res.status(200).json({ message: "Login successful", username: user.username });
      return res.json({ message: "Login successful, redirecting", redirect: "/account" });
      // When there is a match then a session is made for the user.
    } else{
      // console.log("nomatch");
      return res.status(401).json({ error: "username or password does not match" });
 
    }
  } catch (error) {
    console.error(error);
  }
}



// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// favorites
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
async function toggleFavorite(req, res) {
  try {
    let { cocktailId } = req.body;
    const username = req.session.username;

    if (!username) {
      return res.status(401).json({error: "You must be logged in to favorite cocktails." });
    }

    // Ensure cocktailId is a string
    cocktailId = String(cocktailId);  // Convert cocktailId to a string

    // Find the cocktail document
    let cocktail = await db.collection("cocktails").findOne({ _id: cocktailId });

    if (!cocktail) { // Create if it doesn't exist yet
      await db.collection("cocktails").insertOne({
        _id: cocktailId,
        favoritedBy: [username],
      });
      return res.status(200).json({ message: "Cocktail added to favorites" });
    }

    // Make sure favoritedBy is an array
    let favoritedBy = Array.isArray(cocktail.favoritedBy) ? cocktail.favoritedBy : [];

    const isFavorite = favoritedBy.includes(username);

    // Call one of two functions based on whether it is favorited
    if (isFavorite) {
      return await removeFavorite(cocktailId, username, res);
    } else {
      return await addFavorite(cocktailId, username, res);
    }
  } catch (error) {
    console.error("Toggle favorite error:", error);
    res.status(500).json({ error: "Failed to toggle favorite" });
  }
}

async function addFavorite(cocktailId, username, res) {
  try {
    await db.collection("cocktails").updateOne(
      { _id: cocktailId },
      { $addToSet: { favoritedBy: username } }
    );

    res.status(200).json({ message: "Cocktail added to favorites" });

  } catch (error) {
    console.error("Add favorite error:", error);
    res.status(500).json({ error: "Failed to add favorite" });
  }
}

async function removeFavorite(cocktailId, username, res) {
  try {
    await db.collection("cocktails").updateOne(
      { _id: cocktailId },
      { $pull: { favoritedBy: username } }
    );

    res.status(200).json({ message: "Cocktail removed from favorites" });

  } catch (error) {
    console.error("Remove favorite error:", error);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
}




// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// profile + favorites of user
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
async function getFavoriteDrinks(favoriteIds) {
  try {
    if (!Array.isArray(favoriteIds) || favoriteIds.length === 0) {
      // console.log("You haven't added any favorite cocktails yet...");
      return []; // Return empty array
    }
    const favoriteDrinks = await Promise.all(
      favoriteIds.map(async (cocktailId) => {
        try {
          const response = await fetch(
            "https://www.thecocktaildb.com/api/json/v2/961249867/lookup.php?i=" + cocktailId
          );

          if (!response.ok) {
            console.warn("API request failed for cocktail ID" + cocktailId + ":" + response.status);
            return null;
          }
          
          const data = await response.json();

          if (!data.drinks || data.drinks.length === 0) {
            console.warn("No drink found for ID:" + cocktailId);
            return null;
          }

          return data.drinks[0];

        } catch (error) {
          console.error("Error fetching drink" + cocktailId + ":" + error);
          return null;
        }
      })
    );

    return favoriteDrinks.filter((drink) => drink !== null); // Remove null values
  } catch (error) {
    console.error("Error fetching favorite drinks:", error);
    return [];
  }
}


async function showProfile(req, res) {
  try {
    const username = req.session.username;

    // Find all cocktails that the user has favorited
    const favoriteCocktails = await db.collection("cocktails") // loop through cocktails
      .find({ favoritedBy: username }) 
      .toArray(); 

    const favoriteIds = favoriteCocktails.map(cocktail => cocktail._id);

    // Fetch cocktail details from API
    const favoriteDrinks = await getFavoriteDrinks(favoriteIds);

    res.render("pages/account", { 
      username: username,
      favorites: favoriteDrinks 
    });

  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).send("Error loading profile");
  }
}



// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Detail page user favorites
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
async function fetchCocktailDetails(cocktailId) {
  try {
    const response = await fetch("https://www.thecocktaildb.com/api/json/v2/961249867/lookup.php?i=" + cocktailId);
    if (!response.ok) {
      throw new Error("API request failed for cocktail ID" + cocktailId + ":" + response.status);
    }

    const data = await response.json();
    if (!data.drinks || data.drinks.length === 0) {
      return null;
    }

    return data.drinks[0];
  } catch (error) {
    console.error("Error fetching cocktail" + cocktailId + ":" + error);
    return null;
  }
}


async function getRelatedFavorites(cocktailId, currentUser) {
  try {
    const currentCocktail = await db.collection("cocktails").findOne({ _id: cocktailId });

    if (!currentCocktail || !currentCocktail.favoritedBy) {
      return [];
    }

    // remove the current user from the list
    const otherUsersFavorited = currentCocktail.favoritedBy.filter(user => user !== currentUser);

    if (otherUsersFavorited.length === 0) {
      return []; // No other users favorited this drink
    }

    // find all cocktails these users favorited (excluding the current cocktail)
    const relatedCocktails = await db.collection("cocktails").find({ 
      _id: { $ne: cocktailId }, // Exclude the main cocktail
      favoritedBy: { 
        $in: otherUsersFavorited,  // at least one of these users favorited
        $nin: [currentUser]        // currentuser not in array. delete this line? idk
      }
    }).toArray();

    // count how many times each cocktail appears
    const cocktailCounts = {};
    for (const cocktail of relatedCocktails) {
      // count users
      const differentUsers = new Set(cocktail.favoritedBy);  // create a Set to get unique users
      cocktailCounts[cocktail._id] = differentUsers.size;   // use the size of the Set to count unique users
    }

    // sort by most favorited and limit to 5
    const sortedFavoriteIds = Object.keys(cocktailCounts)
      .sort((a, b) => cocktailCounts[b] - cocktailCounts[a]) // High to low
      .slice(0, 5);

    // fetch cocktail details
    const topFiveCocktails = await Promise.all(
      sortedFavoriteIds.map(fetchCocktailDetails)
    );

    return topFiveCocktails;
  } catch (error) {
    console.error("Error finding related favorites:", error);
    return [];
  }
}


async function detailPage(req, res) {
  try {
    const cocktailId = req.query.id;
    const currentUser = req.session.username;

    // fetch current cocktail details
    const cocktail = await fetchCocktailDetails(cocktailId);
    if (!cocktail) {
      return res.status(404).send("Cocktail not found");
    }

    // get related favorite cocktails
    const relatedFavorites = await getRelatedFavorites(cocktailId, currentUser);

    res.render("pages/detailPage", { cocktail, relatedFavorites });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch data", details: error.message });
  }
}

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Default mocktails 
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

app.get('/api/user-status', (req, res) => {
  try{
  
    res.json({
      isLoggedIn: !!req.session.userLoggedIn,
      isAdult: req.session.age >= 18
       });
    } catch(error){
      console.error()

    }

});

// start server
app.listen(8000);
