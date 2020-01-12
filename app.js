const express = require('express');
const path = require('path');
const {check, validationResult} = require('express-validator');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//auth packages
var mysql = require('mysql');
var session = require('express-session');
var passport = require('passport');
var MySQLStore = require('express-mysql-session')(session);
var multer = require('multer');
var expressValidator = require('express-validator');

var bodyParser = require('body-parser');

var connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'root',
    database : 'dbusers'
});

connection.connect(function(err){
    if (err) {
        throw err;
    }
    
    console.log('connected to db');
});

const app = express();
const router = express.Router({ mergeParams: true });
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use(express.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//session storage params
var options = {
    host : 'localhost',
    user : 'root',
    password : 'root',
    database : 'dbusers'
}

var sessionStore = new MySQLStore(options);

//user session management
app .use(session({
    secret: 'qwerty',
    resave: true,
    //create session store
    store: sessionStore,    
    saveUninitialized: false,
    //cookie: {secure: true}
}));

app.use(passport.initialize());
app.use(passport.session());

//static assets
app.use(express.static(path.join(__dirname, 'public')));

//simulate ejs view engine to make use of render(wil be handy for image viewer)
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'public', 'html'));

//router
router.get('/', function(req, res){
   res.render('landingpage'); 
});

router.get('/login', function(req, res){
   res.render('login');   
});

router.get('/registration', function(req, res){
   res.render('registration'); 
});

router.get('/postimage', authenticationMiddleware(), function(req, res){
   console.log(req.user.user_name);
   res.render('postimage'); 
});

router.get('/imagepost', authenticationMiddleware(), function(req, res){
    res.render('imagepost');
});

app.use('/', router);
app.use('/login', router);

//post login
app.post('/auth', function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    
    if (username && password){
        connection.query('SELECT * FROM users_table WHERE user_name = ? AND user_password = ?', [username, password], function(err, results, fields){
           
           if(err){
               throw err;
           } 
           
            if(results.length > 0){
               console.log(results[0]);
               const username = results[0];
               req.login(username, function(err){
                   res.redirect('/');
                });
          
            } 
        });
    } else {
        send('Enter username/password');
        res.end();
    }
});

//added middleware to preven error if logout and not loggedin
router.get('/logout', authenticationMiddleware(), function(req, res){
    req.logout();
    req.session.destroy();//destroys cookie once logged out
    res.redirect('/');   //redirects to root page
 });

passport.serializeUser(function(username, done){
    done(null, username);
});

passport.deserializeUser(function(username, done){
    done(null, username);
    
});

//restrict access if not logged in
function authenticationMiddleware(){
    return(req, res, next) => {
        console.log(`
            req.session.passport.user: ${JSON.
            stringify(req.session.passport)}`);
            
        if(req.isAuthenticated()){
            return next();
        }
        
        res.redirect('/login');
        
    }
}

app.use('/registration', router);

//post reg
app.post('/reg',  [
    check('username').isLength({min: 3}),
    check('username').isAlphanumeric(),
    check('email').isEmail(),
    check('password').isLength({min: 8}),
], function(req, res){

    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var cpassword = req.body.cpassword;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    if(username && email && password && cpassword){
        
        var users = {
            "user_name": username,
            "user_email": email,
            "user_password": password
        }
        
        console.log(users);
        
        if(password == cpassword){
            connection.query('INSERT INTO users_table SET ?', users, function(err, results, fields){
                if(err){
                    throw err;
                }
                
            })
            res.redirect('/login');
            res.end();
            
        }else{
            res.send('passwords must match');
        }
    }else{
        send('Enter user info');
        res.end();
    }    
});

app.use('/postimage', router);

//image upload
//multer storage obj
var storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, path.join(__dirname, 'public', 'images')); //images get put in the images folder
    },
    
    filename: function(request, file, callback){
        callback(null, file.originalname + '-' + Date.now() + path.extname(file.originalname)); //gives the file's original name,timestamp, and extension
    }
});

//image validator
const imageFilter = function(req, file, callback){
    if(!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)){
        req.fileValidationError = 'only images please';
        return callback(new Error('only images please'), false);
    }
    
    callback(null, true);
};

app.post('/upload', (req, res) => {
    
    
    let upload = multer({storage: storage, fileFilter: imageFilter}).single('uploadImage');
    
    upload(req, res, function(err){
            
        if(req.fileValidationError){
            return res.send(fileValidationError);
        }else if(!req.file){
            return res.send('select an image');
        }else if(err instanceof multer.MulterError){
            return res.send(err);
        }else if(err){
            return res.send(err);
        }
        
        var title = req.body.pTitle;
        var description = req.body.pDescription;
        var user = req.user.user_name;
        
        console.log(req.file.path + " " + title + " " + description + " " + user);
   
        var displayPath = path.join('images', req.file.filename);
    
        if(title && description && user && displayPath){
        
            var images = {
                "image_path": displayPath,
                "title": title,
                "description": description,
                "user_name": user
            }
        
            connection.query('INSERT INTO users_images SET ?', images, function(err, results, fields){
                if(err){
                    throw err;
                }
            })
        }
        
        res.render('imagepost', {img: displayPath});
    });        
});

//image viewer
app.use('/imagepost', router);

//search function
app.post('/search', function(req, res){
    
    var searchItem = req.body.item;
    
    
    if(searchItem){
        
        console.log('searching for ' + searchItem);
        
        connection.query('SELECT * FROM users_images WHERE title = ?', [searchItem], function(err, results, fields){
            
            if(err){
                throw err;
            }

            if(results.length > 0){
                
                var found = results[0];
                res.cookie('image', found.image_path);
                
                connection.query('SELECT * FROM images_comments WHERE id = ?', [found.id], function(err, comms, fields){
                    if(comms.length > 0){
                        
                        console.log(comms);
                            
                        res.render('imagepost', {imageTitle: found.title, img: found.image_path, data: JSON.stringify(comms)});
                    }else{
                       res.next(); 
                    }
                 
                });
               
            }        
        
        });
        
    }else{
        console.log('no such image');
        res.redirect('/');
    }
});

app.post('/comment', function(req, res){
    
    var comment = req.body.comment;
    var path = req.cookies.image;
    
    if(comment && path){
        connection.query('SELECT * FROM users_images WHERE image_path = ?', [path], function(err, results, fields){
            if(err){
                throw err
            }
            
            if(results.length > 0){
                var image = results[0];
                
                var comments = {
                    "id" : image.id,
                    "text": comment,
                    "user_name": req.user.user_name
                }
                
                connection.query('INSERT INTO images_comments SET ?', comments, function(err, results, fields){
                    if(err){
                        throw err;
                    }
                })
                
                res.redirect('/');
            }
        })
    }else{
        console.log('incomplete'); 
        res.end();
    }
});


module.exports = app;
