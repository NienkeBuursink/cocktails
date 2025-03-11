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
async function signedUp(req) { // function when submitted form
  try {
    // Destructure form to use password for hashing and separate the rest
    const { userPassword, ...rest } = req.body; 

    // hashing
    console.time("hash");
    const hash = await bcrypt.hash(userPassword, 13);
    console.timeEnd("hash");

    console.log("password:", userPassword);
    console.log("hash:", hash);
    console.log("other data:", rest);

    // Create a new user for mongodb
    const newUser = {
      ...rest,
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
    const { username, userPassword } = req.body;
    console.log(req.body);

    // find user in database
    const collection = db.collection("users");
    const user = await collection.findOne({ username });

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
    console.log("User logged in:", username);
    res.status(200).json({ message: "Login successful", username });

  } catch (error) {
    console.error(error);
  }
}



// start server
app.listen(8000);

