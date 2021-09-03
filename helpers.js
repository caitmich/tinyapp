
const verifyUser = function (users, email) {
  for (const userId in users) {
    if(users[userId].email === email){
    return users[userId];
  } 
}
// return false;
};

module.exports = {
  verifyUser,
}