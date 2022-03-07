const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
  
});


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[shortURL],
    username: req.cookies["username"]
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
  const username = req.cookies["username"];
  const templateVars = {urls: urlDatabase, username: username};
  console.log(username);
  res.render("urls_index", templateVars);
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

app.post("/urls", (req, res) => {
  console.log(req.body);// Log the POST request body to the console
  const newURL = generateRandomString(6);
  urlDatabase[newURL] = req.body.longURL;
  console.log(urlDatabase)
  res.redirect(`/urls/${newURL}`)
    //res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("req body" , req.body);// Log the POST request body to the console
  console.log('req params', req.params)
  const { shortURL} = req.params
  delete urlDatabase[shortURL]
  res.redirect(`/urls`)
})
app.post("/urls/:shortURL/", (req, res) => {
  const { shortURL} = req.params
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls`)
})
app.post("/login", (req, res) => {
  const userName = req.body.username;
  console.log(userName);
  res.cookie(`username`, userName);
  res.redirect(`/urls`);
});
app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect(`/urls`)
})
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});