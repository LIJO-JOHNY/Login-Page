// to load environment varriables from the .env file
if (process.env.NODE_ENV!=='production') {
    require('dotenv').config()
}

const express = require('express');
const session = require('express-session');
const app=express();
const path = require('path');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const methodOverride = require('method-override');
const nocache = require('nocache');


const initializePassport = require('./passport-config');
initializePassport(
    passport,
    email=>users.find(user=>user.email===email),
    id=>users.find(user=>user.id===id)
)
// to store data
const users=[]

app.set('view-engine','ejs');

// middleware config
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

const port = process.env.PORT || 1616;

// load static files
app.use( express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use(nocache('nocache'))


// home
app.get('/', checkAuthenticated,(req,res)=>{
    res.render('index.ejs',{name:req.user.name,users:users});
})
app.post('/',(req,res)=>{

})

// login
app.get('/login',checkNotAuthenticated,(req,res)=>{
    res.render('login.ejs');
});

app.post('/login', checkNotAuthenticated,passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash:true
}))

// register
app.get('/register',checkNotAuthenticated,(req,res)=>{
    res.render('register.ejs');
});

app.post('/register',checkNotAuthenticated,async(req,res)=>{
    try {
        console.log("Registration started")
        const hashedPassword = await bcrypt.hash(req.body.password,10)
        users.push({
            id:Date.now().toString(),
            name:req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch  {
        res.redirect('/register')
    }
    console.log(users)
})

// logout
app.delete('/logout',(req,res)=>{
    req.logout(function(err){
        if(err){
            console.error(err);
        }
        res.redirect('/login')
    })

})

// middleware
function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
     res.redirect('/login')
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}



app.listen(port, () => {
    console.log("Listening on http://localhost:1616");
});