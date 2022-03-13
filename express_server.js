const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { set } = require("express/lib/application");

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
}
const urlDatabase = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    },
    ijz123: {
      longURL: "https://www.hello.ca",
      userID: "a3jscw"
  }
};
const urlsForUser = function(id) {
 // console.log('this is urlsforuser test id', id, urlDatabase)
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};
const cookieMatch = function (cookie, userDatabase) {
  for (const user in userDatabase) {
    if (cookie === user) {
      return true;
    }
  } return false;
}


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
  
});


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const currUserID = req.cookies["user_id"];
  const currUser = users[currUserID]
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[shortURL].longURL,
    user: currUser
    };
  res.render("urls_show", templateVars);
});
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const currUserID = req.cookies["user_id"];
  const currUser = users[currUserID]
  const templateVars = {urls: urlsForUser(currUserID), user: currUser};
  res.render("urls_index", templateVars);
});
app.get("/register", (req, res) => {
  //const currUserID = req.cookies["user_id"];
  //const currUser = currUser(currUserID, users)
  const templateVars = {urls: urlDatabase, user: null};
  res.render("urls_register", templateVars);
});
app.get("/login", (req, res) => {
  const currUserID = req.cookies["user_id"];
  //const currUser = currUser(currUserID, users)
  const currUser = users[currUserID]
  const templateVars = {urls: urlDatabase, user: currUser};
  res.render("urls_login", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  if( urlDatabase[req.params.shortURL]){

    return  res.redirect(urlDatabase[req.params.shortURL].longURL)
  };
res.status(404).send("site doesnt exist")
});

app.post("/urls", (req, res) => {
  //console.log(req.body);// Log the POST request body to the console
  //const newURL = generateRandomString(6);
  const currUserID = req.cookies["user_id"]
  if(currUserID){
    const newURL = generateRandomString(6);
    urlDatabase[newURL] = {longURL: req.body.longURL, userID: currUserID} ;
    return res.redirect(`/urls/${newURL}`)
  }
  res.status(403).send("sorry you are not logged in")
  //console.log(urlDatabase)
    //res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const currUserID = req.cookies["user_id"];
  const { shortURL} = req.params
  const url = urlDatabase[shortURL]
  if(!url){
    return res.status(404).send('this url doesnt exist')
  }
  if(currUserID === url.userID ){
   delete urlDatabase[shortURL]
  } else {
    return res.status(404).send("you are not authorized because you are not the owner of this url")
  }
  res.redirect(`/urls`)
})

app.post("/urls/:shortURL/", (req, res) => {
  const { shortURL} = req.params
  const currUserID = req.cookies["user_id"];
  const url = urlDatabase[shortURL]
  if(!url){
    return res.status(404).send('this url doesnt exist')
  }
  if(currUserID === url.userID ){
    urlDatabase[shortURL].longURL = req.body.longURL
  } else {
    return res.status(404).send("you are not authorized because you are not the owner of this url")
  }
  res.redirect(`/urls`)
})

app.post("/login", (req, res) => {
  const userName = req.body.email;
  const password = req.body.password
  let userFound = null
  //console.log("this is pretest", users)
  for(userID in users ){
    let currUser = users[userID] 
    if(userName === currUser.email && password === currUser.password){
      userFound = currUser
      break
    }  
    
  }
    if(!userFound){
     return res.status(403).send('this doesnt exist')
    }
  console.log("this is the username", userName, userID);
  //console.log("this is the userfound", userFound)
  res.cookie(`user_id`, userID);
  res.redirect(`/urls`);
  
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect(`/urls`)
})

app.post("/register", (req, res) => {
  //req.cookies["username"]
  const userID = generateRandomString(6)
  const email = req.body.email
  const password = req.body.password
  

  if(!email || !password) return res.status(400).send('Email or password can not be empty')
  
  const usersEmail = Object.values(users);
  const findEmail = usersEmail.find(userEmail => {
    return userEmail.email === req.body.email;
  });
  if(findEmail) {
    return res.status(400).send('email already exists')  }
  
  res.cookie('user_id', userID);
    
  const user = {
    id: userID,
    email: email,
    password: password
  }
  
  users[userID] = user
  //console.log('USERS', users)
  res.redirect(`/urls`)
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(length) {
  let result  = '';
  const characters  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}

/**
 * Return user object or null if not found
 */
// function currUser(userID, userDatabase) {
//   if(!userDatabase[userID]) return null
//   return userDatabase[userID]
// }