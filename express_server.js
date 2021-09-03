const express = require("express");
// const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const {verifyUser} = require("./helpers");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// object used to keep track of all urls and their short-forms:
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "e6x827",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: 'xsd50s',
  },
};

//object used to keep track of users:
const users = { 
  // "userRandomID": {
  //   id: "userRandomID", 
  //   email: "user@example.com", 
  //   password: "purple-monkey-dinosaur"
  // },
  'xsd50s': {
    id: 'xsd50s', 
    email: 'user0@example.com', 
    password: '$2b$10$D.G9c3/vzLJBfDhLQHUYEeeEeQQADDIFVqWCNa3IyS3DtcQXbdsbS' 
    // "000"
  },
  "e6x827": {
    id: "e6x827",
    email: 'hello@hello.com',
    password: '$2b$10$17kOBe/C9sBIYsIhMNVIm.W47nCjJ1rpHEtbAE32OgAEVu9adNYxG'
    // hello
  }
};

// const verifyUser = function (users, email) {
//   for (const userId in users) {
//     if(users[userId].email === email){
//     return users[userId];
//   } 
// }
// return false;
// };

const urlsForUser = function(id) {
let myUrls = []
  //loop through url database
  for (address in urlDatabase) {
    if (urlDatabase[address].userId === id){
      //add shortURL to arr
     myUrls.push(address)
    }
  }
  //return urls with matching user id
return myUrls.map(String);
};

//register
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email
  const enterPassword = req.body.password
  const password = bcrypt.hashSync(enterPassword, 10);

  //return error if one field is blank
  if (email === '' || enterPassword === ''){
    return res.send(res.statusCode = 400, "Please complete both fields");
  }
  
  //check to see if email is already registered
  const authenticate = verifyUser(users, email);

  if (authenticate) {
    return res.send(res.statusCode = 400, 'Email already registered');
  } 

//if all is good, add new user to Db
  users[id] = { id, email, password };

//create cookie
 req.session.user_id = id;
 console.log(req.session.user_id);

  res.redirect("/urls");
  
});


//Login
app.post("/login", (req, res) => {
const email = req.body.email;

const userInfo = verifyUser(users, email);
const hashedPassword = userInfo.password;

let compareHashed = bcrypt.compareSync(req.body.password, userInfo.password);


// if account exists:
if (userInfo) {
//if password matched hashed password stored in userInfo:
  if (compareHashed === true) {
  req.session.user_id = userInfo.id;
  return res.redirect("/urls"); 
 
} 
    return res.status(403).send('Wrong Password');

}
 
});

//Delete a url:
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  
  // const myUrls = urlsForUser(userId);
  const shortURL = req.params.shortURL;

  const belongsTo = urlDatabase[req.params.shortURL].userId;

  if (!userId || userId !== belongsTo) {
    res.send(res.statusCode = 400, "You cannot delete Urls that are not your own");
    console.log(userId);
    
  } else {
    // delete URL resource from Db
    delete urlDatabase[shortURL];
    console.log('success');
    res.redirect("/urls");
  }
});

//Logout
app.post("/logout", (req, res) => {
  const id = req.session.user_id;
  console.log(req.session.user_id);
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
    res.send(res.statusCode = 400, "You cannot edit Urls that are not your own");
    return res.redirect("/urls");
    
  } else {
    //reassign longURL to new url
    urlDatabase[shortURL].longURL = longURL

    res.redirect("/urls");
  }
  
});

//enter new url
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
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
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userId = req.session.user_id;

  urlDatabase[shortURL] = { longURL: longURL, userId: userId };
  console.log(urlDatabase);
  res.redirect('/urls/' + shortURL);         // Respond with redirect
});

//show tinyURL with corresponding longURL
app.get("/urls/:shortURL", (req, res) => {

  const userId = req.session.user_id;

  //returns an array of the shortURLs that belong to the logged in user:
  const myUrls = urlsForUser(userId);

  const templateVars = { 
    user: users[userId],
    shortURL: req.params.shortURL, 
    longURL: (urlDatabase[req.params.shortURL].longURL) , 
    myUrls
  };

  res.render("urls_show", templateVars);
});

//pass url database to our template in urls_index
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  console.log(users[userId]);

  const myUrls = urlsForUser(userId);
  const templateVars = { 
    user: users[userId],  
    urls: urlDatabase, 
    myUrls
  };

  res.render("urls_index", templateVars);
});

//redirect shortURL to its longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = { user: users[userId] };
  res.render('urls_register', templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = { user: users[userId] };
  res.render('urls_login', templateVars);
  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

module.exports = {
  users,
}