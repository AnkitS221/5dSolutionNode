const userModule = require('../modules/user_module')

function registerUser (req, res, next) {
  userModule.registerUser(req, res, next)
    .then((data) => {
      return res.status(200).json(data)
    })
    .catch(err => {
      return res.status(500).json(err)
    })
}

function login (req, res, next) {
  userModule.login(req, res, next)
    .then((data) => {
      return res.status(200).json(data)
    })
    .catch(err => {
      return res.status(500).json(err)
    })
}

function confirmUser (req, res, next) {
  userModule.confirmUser(req, res, next)
    .then((data) => {
      return res.status(200).json(data)
    })
    .catch(err => {
      return res.status(500).json(err)
    })
}

function getStates (req, res, next) {
  userModule.getStates(req, res, next).then((data) => {
    return res.status(200).json(data)
  })
}

function getCities (req, res, next) {
  userModule.getCities(req, res, next).then((data) => {
    return res.status(200).json(data)
  })
}

function forgotPassword (req, res, next) {
  userModule.forgotPassword(req, res, next)
    .then((data) => {
      return res.status(200).json(data)
    })
    .catch(err => {
      return res.status(500).json(err)
    })
}

function resetPassword (req, res, next) {
  userModule.resetPassword(req, res, next)
    .then((data) => {
      return res.status(200).json(data)
    })
    .catch(err => {
      return res.status(500).json(err)
    })
}

function updateUser (req, res, next) {
  userModule.updateUser(req, res, next)
    .then((data) => {
      return res.status(200).json(data)
    })
    .catch(err => {
      return res.status(500).json(err)
    })
}

function getUserDetails (req, res, next) {
  userModule.getUserDetails(req, res, next)
    .then((data) => {
      return res.status(200).json(data)
    })
    .catch(err => {
      return res.status(500).json(err)
    })
}

module.exports = { registerUser, login, confirmUser, getStates, getCities, forgotPassword, resetPassword, updateUser, getUserDetails }
