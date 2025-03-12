// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Setup
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
require('dotenv').config();
const xss = require('xss');
const html = xss('<script>alert("xss");</script>');
console.log(html);
const express = require("express");
const bcrypt = require("bcrypt");
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



// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Routes
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
app.get("/", onHome);
app.post("/searchCocktail", onHome)
app.get("/signup", signUp);
app.post("/signup", signedUp);
app.get("/login", login);
app.post("/login", loggedIn);


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
      password: hash
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
    
    if (!isMatch) {
      return res.status(401).json({ error: "username or password does not match" });
    }

    // logged in
    console.log("User logged in:", user.username );
    res.status(200).json({ message: "Login successful", username: user.username });;

  } catch (error) {
    console.error(error);
  }
}



// start server
app.listen(8000);

