const express = require("express");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { verifyUser, generateRandomString, urlsForUser } = require("./helpers");
const { urlDatabase, users } = require("./db");


const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

//register for an account
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const enterPassword = req.body.password;
  const password = bcrypt.hashSync(enterPassword, 10);

  //return error if one field is blank
  if (!email || !enterPassword) {
    return res.send((res.statusCode = 400), "Please complete both fields");
  }

  //check to see if email is already registered
  const authenticate = verifyUser(users, email);

  if (authenticate) {
    return res.send((res.statusCode = 400), "Email already registered");
  }

  //if all is good, add new user to Db
  users[id] = { id, email, password };

  //create cookie
  req.session.user_id = id;

  res.redirect("/urls");
});

//Login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const userInfo = verifyUser(users, email);

  if (!email || !password) {
    return res.status(400).send("Please complete both fields");
  }

  if (!userInfo) {
    return res.status(400).send("That email is not registered");
  }
  // if account exists:
  if (userInfo) {
    let compareHashed = bcrypt.compareSync(
      req.body.password,
      userInfo.password
    );
    //if password matches hashed password stored in userInfo:
    if (compareHashed) {
      req.session.user_id = userInfo.id;
      return res.redirect("/urls");
    }
    return res.status(403).send("Wrong Password");
  }
});

//Delete a url:
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  const belongsTo = urlDatabase[req.params.shortURL].userId;

  if (!userId || userId !== belongsTo) {
    res.send(
      (res.statusCode = 400),
      "Sorry, you Cannot Delete Urls That are Not Registered to your Account"
    );
  } else {
    // delete URL resource from Db
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

//Logout
app.post("/logout", (req, res) => {
  //delete cookie
  req.session.user_id = null;

  res.redirect("/urls");
});

//Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const belongsTo = urlDatabase[req.params.shortURL].userId;

  if (!userId || userId !== belongsTo) {
    res.send(
      (res.statusCode = 400),
      "You cannot edit Urls that are not your own"
    );
    return res.redirect("/urls");
  } else {
    //reassign longURL to new url
    urlDatabase[shortURL].longURL = longURL;

    res.redirect("/urls");
  }
});

//Create new ShortURL
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {
    user: users[userId],
  };

  if (!userId) {
    res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

//add new ShortURL to Db along with associated LongURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userId = req.session.user_id;

  // if not logged in, cannot add to database
  if (!userId) {
    return res.send(res.statusCode = 400, "Please log in or create an account");
  }

  // if logged in, add new urls to database
  urlDatabase[shortURL] = { longURL: longURL, userId: userId };
  res.redirect("/urls/" + shortURL);
});

//render urls/:id page
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;

  if (!userId) {
    return res.send(
      (res.statusCode = 400),
      "You do not Have Permission to Access this Page. Please login or add a New URL to your Library"
    );
  }

  const urlExists = urlDatabase[req.params.shortURL];

  if (!urlExists) {
    return res.send((res.statusCode = 400), "This shortURL doesn't exist");
  }

  //returns an array of the shortURLs that belong to the logged in user:
  const myUrls = urlsForUser(userId);

  if (urlDatabase[req.params.shortURL].userId !== userId) {
    return res.send((res.statusCode = 400), "You do not have permisison to access this page");
  }

  const templateVars = {
    user: users[userId],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    myUrls,
  };

  res.render("urls_show", templateVars);
});

//Render URLs that belong to user in urls_index
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;

  const myUrls = urlsForUser(userId);
  const templateVars = {
    user: users[userId],
    urls: urlDatabase,
    myUrls,
  };

  res.render("urls_index", templateVars);
});

//Redirect shortURL to its longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  

  for (const input in urlDatabase) {
    if (input === shortURL) {
      const longURL = urlDatabase[req.params.shortURL].longURL;
      return res.redirect(longURL);
    }
  }
  return res.status(400).send("That URL Doesn't Exist");
});

//Render register page
app.get("/register", (req, res) => {
  const userId = req.session.user_id;

  if (userId) {
    return res.redirect("/urls");
  }

  const templateVars = { user: users[userId] };
  res.render("urls_register", templateVars);
});

//Render login page
app.get("/login", (req, res) => {
  const userId = req.session.user_id;

  if (userId) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[userId] };
  res.render("urls_login", templateVars);
});

app.get("/", (req, res) => {
  const userId = req.session.user_id;

  if (userId) {
    res.redirect("/urls");
  }

  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

module.exports = {
  users,
};
