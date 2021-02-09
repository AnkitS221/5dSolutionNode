module.exports = function () {
    var mongoose = require('mongoose')
    mongoose.connect(process.env.MONGODB_LINK, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false 
    }, function (error) {
      if (error) {
        console.log('error' + error)
      } else {
        console.log(`MongoDB is connected on ${process.env.MONGODB_LINK}`)
      }
    })
  }
  