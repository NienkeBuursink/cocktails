# Project Tech: Pourfection

This is a school project where we learned partly about the backend. Our website is able to sort, filter and search for a cocktail/mocktail. If you're under 18 you will only see mocktails.

## Dependencies used
* Node.js - JavaScript runtime environment
* Express.js - Web framework for Node.js
* MongoDB - Database for storing data
* bcrypt - For password hashing
* express-session - For session management
* dotenv - To manage environment variables
* xss - To prevent XSS attacks
* validator - For input validation

## Installation
1. Clone this repository
git clone <repository-url>

2. Install dependencies
npm install express dotenv xss bcrypt express-session mongodb validator

3. Create a .env file and add the following variables
URI=your_mongodb_uri
DB_NAME=your_database_name

4. Start the server
node server.js

## Functions
1. Users can make an account and sign in/out.
2. They are able to search for cocktails/mocktails.
3. They can filter/sort/match.

## Team
* Nienke B.- Backend Developer
* Julian v.H. - Backend Developer
* Lisa L.- Frontend Developer
* Matthew D. - Frontend Developer

## License
- 