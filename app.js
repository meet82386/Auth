//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express()

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// // Apply secret always before making model.
// userSchema.plugin(encrypt, { secret : process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});

// When user registers the post request is sent to "/register" route
let saltRounds = 10;
app.post("/register",  function(req, res) {

    bcrypt.hash(req.body.password, saltRounds, function(err, hash){
        const newUser = new User({
            email: req.body.username,
            password: hash
        });
        try {
            newUser.save();
            res.render("secrets");
        } catch (err) {
            console.log(err);
        };
    });

});

// Post request from login form
app.post("/login", async function(req, res) {
    

    try {
        let mail = req.body.username;
        let pwd = req.body.password;

        // mongoose-encrypt will automatically decrypts the password here
        const person = await User.findOne({ 'email' : mail});
        if (person !== null) {
            bcrypt.compare(pwd, person.password, function (err, result) {
                if(result === true) {
                    res.render("secrets");
                } else {
                    console.log("Incorrect password");
                }
            })
        } else {
            console.log("No user found.")
        }
        

    } catch (err) {
        console.log(err);

    }
});


app.listen(3000, function() {
    console.log('server started on port 3000.')
});