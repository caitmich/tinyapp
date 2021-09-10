const { urlDatabase, users } = require("./db");

//Verify that input email matches an email in the user Db
const verifyUser = function (users, email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
};

//generate random 6-digit alpha-numeric code
function generateRandomString() {
  return Math.random().toString(36).slice(-6);
};

//return an array of URLs that are linked to the userId
const urlsForUser = function (id) {
  console.log('database:', urlDatabase)
  let myUrls = [];
  for (const address in urlDatabase) {
    if (urlDatabase[address].userId === id) {
      myUrls.push(address);
    }
  }
  //return urls with matching user ids
  return myUrls.map(String);
};

module.exports = {
  verifyUser,
  generateRandomString,
  urlsForUser
};
