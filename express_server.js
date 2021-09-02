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

//object used to keep track of users:
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const verifyUser = function (users, email) {
  for (const userId in users) {
    if(users[userId].email === email){
    return users[userId];
  } 
}
return false;
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
  const id = req.cookies['user_id'];
  res.clearCookie('user_id', id);

  res.redirect("/urls");
});

// //Login
app.post("/login", (req, res) => {
const email = req.body.email;
const password = req.body.password;

const verifyEmail = verifyUser(users, email);

if (verifyEmail === false) {
  return res.send(res.statusCode = 403, 'Email not Found');
}
if (verifyEmail.password !== password) {
  return res.send(res.statusCode = 403, 'Wrong Password');
}


  res.cookie('user_id', verifyEmail.id);
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
  const userId = req.cookies["user_id"]
  const templateVars = { 
    user: users[userId]  
  };

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

  const userId = req.cookies["user_id"]
  const templateVars = { 
    user: users[userId],
    shortURL: req.params.shortURL, 
    longURL: (urlDatabase[req.params.shortURL]) 
  };

  res.render("urls_show", templateVars);
});

//pass url database to our template in urls_index
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"]
  console.log(users[userId]);
  const templateVars = { 
    user: users[userId],  
    urls: urlDatabase };

  res.render("urls_index", templateVars);
});

//redirect shortURL to its longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"]
  const templateVars = { user: users[userId] };
  res.render('urls_register', templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email
  const password = req.body.password

  //return error if one field is blank
  if (email === '' || password === ''){
    return res.send(res.statusCode = 400, "Please complete both fields");
  }
  
  //check to see if email is already registered
  const authenticate = verifyUser(users, email);

  if (authenticate !== false) {
    return res.send(res.statusCode = 400, 'Email already registered');
  } 

//if all is good, add new user to Db
  users[id] = { id, email, password };

//create cookie
  res.cookie('user_id', id);

  res.redirect("/urls");
  
});

app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"]
  const templateVars = { user: users[userId] };
  res.render('urls_login', templateVars);
  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});