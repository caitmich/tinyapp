//Verify that input email matches an email in the user Db
const verifyUser = function (users, email) {
  for (const userId in users) {
    if(users[userId].email === email){
    return users[userId];
  } 
}
};

//generate random 6-digit alpha-numeric code
function generateRandomString() {
  return Math.random().toString(36).slice(-6);
};


module.exports = {
  verifyUser,
  generateRandomString,

}