module.exports = function (app) {
    const userController = require('../controllers/user_controller')
    app.post('/signup', userController.registerUser)
    app.post('/signIn', userController.login)
  }