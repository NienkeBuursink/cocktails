require('dotenv').config();
const xss = require('xss');
// const html = xss('<script>alert("xss");</script>');
// console.log(html);
const express = require("express");
const app = express();



const { MongoClient } = require("mongodb");
// Replace the uri string with your MongoDB deployment's connection string.
const uri = process.env.URI;
const client = new MongoClient(uri);
const db = client.db(process.env.DB_NAME);
// const collection = db.collection(process.env.DB_collection)

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

// Inex pagina proberen te renderen.

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.listen(8000)
app.set("view engine", "ejs");
app.use("/static", express.static("static"));


app.get("/", onhome)

function onhome(req, res){
    res.render("pages/index.ejs") //pages has to be added to search for the index file as it is in a seperate folder 
}