module.exports = function (app) {
    const userController = require('../controllers/moment_controller')
    app.post('/add-moment', userController.addMoment)
    app.get('/moment-list', userController.getMoments)
    app.delete('/deleteMoment/:id', userController.deleteMoment)
    app.put('/updateMoment', userController.updateMoment)
}