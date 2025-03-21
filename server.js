// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Setup
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
require('dotenv').config();
const xss = require('xss');
const html = xss('<script>alert("xss");</script>');
console.log(html);
const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session")
const { MongoClient } = require("mongodb");
const validator = require('validator');

const app = express();
// Replace the uri string with your MongoDB deployment's connection string.
const uri = process.env.URI;
const client = new MongoClient(uri);
const db = client.db(process.env.DB_NAME);
// const collection = db.collection(process.env.DB_collection)



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use("/static", express.static("static"));



// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Run MongoDB
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
async function run() {
  console.log("running...")
  try {
    await client.connect();
    // database and collection code goes here
    // find code goes here
    // iterate code goes here
    console.log("connected to database.");
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
  cookie: { secure: process.env.NODE_ENV === 'production' }
  // Resave is for not resaving the session when nothing changes
  // SaveUninitialized is for saving each NEW session, even when nothing has changed
  // Dont forget to add the SESSION_SECRET to your own .env file

  
}))

const checkingIfUserIsLoggedIn = (req, res, next) => {
  console.log("Middleware called");
  console.log("Session:", req.session);
  console.log("UserLoggedIn:", req.session.userLoggedIn);
  
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
app.get("/login", login);
app.post("/login", loggedIn);
app.get('/account', checkingIfUserIsLoggedIn, showProfile);
app.post("/addFavorite", addFavorite);



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
    

function login(req, res){
  try {
    console.log(req.body);
    res.render("pages/logIn");
  } catch (error) {
    console.log(error);
  }
}

function signUp(req, res){
  try {
    console.log(req.body);
    res.render("pages/signUp");
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
    console.log(req.body);

    // Validate inputs
    if (!validator.isLength(username, { min: 3, max: 20 })) {
      return res.status(400).json({ error: "Username must be between 3 and 20 characters" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    if (!validator.isStrongPassword(userPassword, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })) {
      return res.status(400).json({ error: "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter and one number." });
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
    console.log("password:", userPassword);
    console.log("hash:", hash);
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
    const result = await collection.insertOne(newUser);

    console.log(`New user created with id: ${result.insertedId}`);

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
    console.log(isMatch);
    if (isMatch) {
      req.session.userLoggedIn = true;
      req.session.username = user.username;
      // logged in
      console.log("User logged in:", user.username );
      // res.status(200).json({ message: "Login successful", username: user.username });
      return res.redirect('/account');
      // When there is a match then a session is made for the user.
    } else{
      console.log("nomatch");
      return res.status(401).json({ error: "username or password does not match" });
 
    }
  } catch (error) {
    console.error(error);
  }
}



// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// favorites
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
async function addFavorite(req, res) {
  try {
    const { cocktailId } = req.body;
    const username = req.session.username;

    // Validate cocktailId
    if (!cocktailId || typeof cocktailId !== 'string') {
      return res.status(400).json({ error: "Invalid cocktail ID" });
    }

    // Update user document to add the cocktail to favorites
    const result = await db.collection("users").updateOne(
      { username: username },
      { $addToSet: { favorites: cocktailId } }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: "Cocktail already in favorites or user not found" });
    }

    res.status(200).json({ message: "Cocktail added to favorites" });
  } catch (error) {
    console.error("Add favorite error:", error);
    res.status(500).json({ error: "Failed to add favorite" });
  }
}



// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// profile
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
async function showProfile(req, res) {
  try {
    const username = req.session.username;
    const user = await db.collection("users").findOne(
      { username: username },
      { projection: { username: 1, favorites: 1 } }
    );

    if (!user) {
      return res.status(404).send("User not found");
    }

    const favoriteDrinks = await getFavoriteDrinks(user.favorites);

    res.render("pages/account", { 
      username: user.username,
      favorites: favoriteDrinks 
    });

  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).send("Error loading profile");
  }
}


async function getFavoriteDrinks(favoriteIds) {
  try {
    if (!Array.isArray(favoriteIds) || favoriteIds.length === 0) { // Check if favorites exists and is an array
      console.log("No favorites or invalid favorites array.");
      return []; // Return an empty array if there are no favorites or it's not an array
    }
    const favoriteDrinks = await Promise.all(
      favoriteIds.map(async (cocktailId) => {
        const response = await fetch(
          `https://www.thecocktaildb.com/api/json/v2/961249867/lookup.php?i=${cocktailId}`
        );
        const data = await response.json();
        return data.drinks[0];
      })
    );
    return favoriteDrinks;
  } catch (error) {
    console.error("Error fetching favorite drinks:", error);
    return [];
  }
}


app.get('/account', checkingIfUserIsLoggedIn, (req, res) => {
  res.render('pages/account.ejs', { username: req.session.username });
});
// The code above is used for protected routes
// start server
app.listen(8000);