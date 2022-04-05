const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
let cookieSession = require("cookie-session");
const { set } = require("express/lib/application");
const bcrypt = require("bcryptjs");
const getUserByEmail = require("./helpers.js")
const urlsForUser = require("./helpers.js")
const generateRandomString = require("./helpers.js")


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);
//this is for new urls
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
  };
  res.render("urls_new", templateVars);
});
//endpoint for short urls
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const currUserID = req.session["user_id"];
  const currUser = users[currUserID];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: currUser,
  };
  res.render("urls_show", templateVars);
});
app.get("/", (req, res) => {
  res.redirect("/urls");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const currUserID = req.session["user_id"];
  const currUser = users[currUserID];
  const templateVars = { urls: urlsForUser(currUserID), user: currUser };
  res.render("urls_index", templateVars);
});
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: null };
  res.render("urls_register", templateVars);
});
app.get("/login", (req, res) => {
  const currUserID = req.session["user_id"];
  const currUser = users[currUserID];
  const templateVars = { urls: urlDatabase, user: currUser };
  res.render("urls_login", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    return res.redirect(urlDatabase[req.params.shortURL].longURL);
  }
  res.status(404).send("site doesnt exist");
});

app.post("/urls", (req, res) => {
  const currUserID = req.session["user_id"];
  if (currUserID) {
    const newURL = generateRandomString(6);
    urlDatabase[newURL] = { longURL: req.body.longURL, userID: currUserID };
    return res.redirect(`/urls/${newURL}`);
  }
  res.status(403).send("sorry you are not logged in");
});


//endpoint for delete function if the user is logged in
app.post("/urls/:shortURL/delete", (req, res) => {
  const currUserID = req.session["user_id"];
  const { shortURL } = req.params;
  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(404).send("this url doesnt exist");
  }
  if (currUserID === url.userID) {
    delete urlDatabase[shortURL];
  } else {
    return res
      .status(404)
      .send("you are not authorized because you are not the owner of this url");
  }
  res.redirect(`/urls`);
});

//endpoint for short url
app.post("/urls/:shortURL/", (req, res) => {
  const { shortURL } = req.params;
  const currUserID = req.session["user_id"];
  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(404).send("this url doesnt exist");
  }
  if (currUserID === url.userID) {
    urlDatabase[shortURL].longURL = req.body.longURL;
  } else {
    return res
      .status(404)
      .send("you are not authorized because you are not the owner of this url");
  }
  res.redirect(`/urls`);
});

// kind of self explanitory but this is the logic behind logging in
app.post("/login", (req, res) => {
  const userName = req.body.email;
  const password = req.body.password;
  let userFound = null;

  for (userID in users) {
    let currUser = users[userID];
    if (
      userName === currUser.email &&
      bcrypt.compareSync(password, currUser.password)
    ) {
      userFound = currUser;
      break;
    }
  }
  if (!userFound) {
    return res.status(403).send("this doesnt exist");
  }
  console.log("this is the username", userName, userID);
  req.session["user_id"] = userID;
  res.redirect(`/urls`);
});

//logout function
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});
//register section
app.post("/register", (req, res) => {
  const userID = generateRandomString(6);
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password)
    return res.status(400).send("Email or password can not be empty");
  if (getUserByEmail(email, users)) {
    return res.status(400).send("email already exists");
  }

  req.session["user_id"] = userID;

  const user = {
    id: userID,
    email: email,
    password: hashedPassword,
  };
  users[userID] = user;
  res.redirect(`/urls`);
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});