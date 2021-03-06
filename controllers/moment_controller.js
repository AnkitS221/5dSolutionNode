const momentModule = require('../modules/moment_module')

function addMoment(req, res, next) {
    momentModule.addMoment(req, res, next)
        .then((data) => {
            return res.status(200).json(data)
        })
        .catch(err => {
            return res.status(500).json(err)
        })
}

function getMoments(req, res, next) {
    momentModule.getMoments(req, res, next)
        .then((data) => {
            return res.status(200).json(data)
        })
        .catch(err => {
            return res.status(500).json(err)
        })
}

function deleteMoment(req, res, next) {
    momentModule.deleteMoment(req, res, next)
        .then((data) => {
            return res.status(200).json(data)
        })
        .catch(err => {
            return res.status(500).json(err)
        })
}

function updateMoment(req, res, next) {
    momentModule.updateMoment(req, res, next)
        .then((data) => {
            return res.status(200).json(data)
        })
        .catch(err => {
            return res.status(500).json(err)
        })
}

module.exports = { addMoment, getMoments, deleteMoment, updateMoment }