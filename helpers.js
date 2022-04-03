const getUserByEmail = function(email, users) {
  console.log(email, users)
  for (const user in users) {
    console.log("this is my", user)
    if (users[user].email === email) {
      return user ;
    }
  }
  return false;
};

module.exports =  getUserByEmail 