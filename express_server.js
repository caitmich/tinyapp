const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());



// object used to keep track of all urls and their short-forms:
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Delete a url:
app.post("/urls/:shortURL/delete", (req, res) => {
  //fetch url based on shortURL
  const shortURL = req.params.shortURL;
  //delete URL resource from Db
  delete urlDatabase[shortURL]
  //redirect to /urls
  res.redirect("/urls");
});

//Logout
app.post("/logout", (req, res) => {
  const username = req.cookies['username'];
  res.clearCookie('username', username);

  res.redirect("/urls");
});

//Login
app.post("/login", (req, res) => {
  const value = req.body['username'];
  res.cookie('username', value);

  res.redirect("/urls");
});

//Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

//enter new url
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//create a new tinyURL
function generateRandomString() {
  return Math.random().toString(36).slice(-6);
};

//add new url and tinyURL to Db
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL;  // Log the POST request to urlDatabase
  res.redirect('/urls/' + shortURL);         // Respond with redirect
});

//show tinyURL with corresponding longURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: (urlDatabase[req.params.shortURL]) };
  res.render("urls_show", templateVars);
});

//pass url database to our template in urls_index
app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//redirect shortURL to its longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});