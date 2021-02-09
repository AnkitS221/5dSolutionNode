var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var cors = require('cors')
var errorhandler = require('errorhandler')
var expressSanitizer = require('express-sanitizer')
var RateLimit = require('express-rate-limit')
require('dotenv').config({ path: __dirname + '/.env' })
require('./services/mongoConnect')()

var isProduction = process.env.NODE_ENV

var app = express()

app.set('trust proxy', true)


var limiter = new RateLimit({
  windowMs: 1 * 1000,
  max: 200,
  delayMs: 0,
  statusCode: 429,
  message: 'Too many requests created from this IP, please try again after an hour'
})
app.use(limiter)
app.use(cors())
app.use(bodyParser.json())
app.use(expressSanitizer())
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }))
app.use(bodyParser.json())


// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
// app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }))

app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'public')))

app.use('/public', express.static(path.join(__dirname, '/public')))

require('./routes/user_routes')(app)
require('./routes/moment_routes')(app)
if (!isProduction) {
  app.use(errorhandler())
}

app.get('/', function (req, res) {
  res.status(200).send({ status: 'All good', meesage: 'Server is up and running' })
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// development error handler will print stacktrace
if (!isProduction) {
  app.use(function (err, req, res, next) {
    logger.error(err.stack)
    res.status(err.status || 500)
    res.json({
      errors: {
        message: err.message,
        error: err
      }
    })
  })
}

// production error handler, no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.json({
    errors: {
      message: err.message,
      error: {}
    }
  })
})

module.exports = app
