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

function generateRandomString(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports =  {getUserByEmail, urlsForUser, generateRandomString} 