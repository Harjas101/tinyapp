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


//this function brings up the urls for the current user logged in
const urlsForUser = function (id) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

module.exports =  {getUserByEmail, urlsForUser} 