// express
const express = require("express")
const app = express()

console.log('NODE_ENV', process.env.NODE_ENV);
console.log('JWT_SECRET', process.env.JWT_SECRET);
console.log('PG_HOST', process.env.PG_HOST);
console.log('---');

// .env
if (process.env.NODE_ENV !== "production") {
  // Load environment variables from .env file in non prod environments
  require("dotenv").config()
}

// parsers
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
app.use(bodyParser.json())
app.use(cookieParser(process.env.COOKIE_SECRET))

// add the client URL to the CORS policy
const cors = require("cors")
const whitelist = process.env.WHITELISTED_DOMAINS ? process.env.WHITELISTED_DOMAINS.split(",") : []
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}
app.use(cors(corsOptions))

// postgres
const init = require('./pg/utils/init');
init().then(() => console.log('Connected to the pg database'));
const store = require('./pg/utils/session');
const passport = require("./pg/passport");

// session
const session = require("express-session");
app.use(session({
  store,
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
  cookie: { secure: true, sameSite: 'none' }
}))

// passport
app.use(passport.initialize())
app.use(passport.session())

// main route
app.get("/", (req, res) => {
  res.json({ success: true })
})

// old routes
const routerAuth = require("./pg/controller/router/auth");
const routerUser = require("./pg/controller/router/user");
const routerFile = require("./pg/controller/router/file");
const routerModule = require("./pg/controller/router/module");
const routerBlock = require("./pg/controller/router/block");
const routerMaterial = require("./pg/controller/router/material");
const routerTask = require("./pg/controller/router/task");
const routerQuestion = require("./pg/controller/router/question");
app.use('/api/auth', routerAuth);
app.use('/api/user', routerUser);
app.use('/api/file', routerFile);
app.use('/api/module', routerModule);
app.use('/api/block', routerBlock);
app.use('/api/material', routerMaterial);
app.use('/api/task', routerTask);
app.use('/api/question', routerQuestion);

// files
const fs = require('fs');
const dir = './files';
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

// start the server in port 8081
const server = app.listen(process.env.PORT || 8081, function () {
  const port = server.address().port

  console.log("App started at port:", port)
})
