const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userId: "e6x827",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "xsd50s",
  },
};

//object used to keep track of users:
const users = {
  xsd50s: {
    id: "xsd50s",
    email: "user0@example.com",
    password: "$2b$10$D.G9c3/vzLJBfDhLQHUYEeeEeQQADDIFVqWCNa3IyS3DtcQXbdsbS",
  },
  e6x827: {
    id: "e6x827",
    email: "hello@hello.com",
    password: "$2b$10$17kOBe/C9sBIYsIhMNVIm.W47nCjJ1rpHEtbAE32OgAEVu9adNYxG",
  },
};

module.exports = {
  urlDatabase,
  users
}