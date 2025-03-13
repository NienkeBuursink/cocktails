// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Setup
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
require('dotenv').config();
const xss = require('xss');
// const html = xss('<script>alert("xss");</script>');
// console.log(html);
const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session")
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
// Session keys
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET ,
  // Resave is for not resaving the session when nothing changes
  // SaveUninitialized is for saving each NEW session, even when nothing has changed
  // Dont forget to add the SESSION_SECRET to your own .env file

  
}))


// app.get('/', function(req, res, next) {
//   if (req.session.views) {
//     req.session.views++
//     res.setHeader('Content-Type', 'text/html')
//     res.write('<p>views: ' + req.session.views + '</p>')
//     res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
//     res.end()
//     console.log("if")
//   } else {
//     req.session.views = 1
//     res.end('welcome to the session demo. refresh!')
//     console.log("else")
//   }
// })

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// signing up with bcrypt
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
async function signedUp(req, res) { // function when submitted form
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
    if (isMatch) {
      req.session.userLoggedIn = true
      console.log("match")
      // req.session.username = 
      // When there is a match then a session is made for the user.
    } else{
      console.log("nomatch")
      return res.status(401).json({ error: "username or password does not match" });
 
    }

    // logged in
    console.log("User logged in:", username);
    res.status(200).json({ message: "Login successful", username });

  } catch (error) {
    console.error(error);
  }
}

const checkingIfUserIsLoggedIn = (req, res, next) => {
  if (req.session.userLoggedIn) {
    res.render("pages/account")
    console.log("checkingIf")
  } else {
    res.redirect("/");
    console.log("checkingElse")
  }
};
// start server
app.listen(8000);

