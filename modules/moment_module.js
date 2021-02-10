const Moment = require("../models/moment_model");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const fs = require("fs");
const csc = require("country-state-city").default;
const multer = require("multer");
const url = require("url");

function addMoment(req, res, next) {
    return new Promise((resolve, reject) => {
        try {
            let fileName;
            const storage = multer.diskStorage({
                destination: function (req, file, cb) {
                    cb(null, __dirname + '/../public/moments/')
                },
                filename: function (req, file, cb) {
                    fileName = file.originalname;
                    cb(null, file.originalname)
                }
            })

            const fileFilter = (req, file, cb) => {
                if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
                    cb(null, true)
                } else {
                    reject({ status: 'Error', message: 'File must be Image' })
                    cb(null, false)
                    return
                }
            }
            const upload = multer({
                storage: storage,
                fileFilter: fileFilter
            }).single('propic')
            upload(req, null, function (error) {
                if (error) resolve({ status: 'Error', message: 'Error while uploading File' })
                else {
                    req.body.tags = (req.body.tags.split(","));
                    req.body.fileName = fileName;
                    const user = new Moment(req.body);
                    user.save((err, doc) => {
                        if (err) {
                            if (err.code == 500) {
                                reject({ status: "Error", message: err.error });
                            } else {
                                const valError = [];
                                Object.keys(err.errors).forEach((key) =>
                                    valError.push(err.errors[key].message)
                                );
                                reject({ status: "Error", message: valError });
                            }
                        } else {
                            resolve({ status: "Success", data: req.body });
                        }
                    });
                }
            });
        } catch (error) {
            console.log(error);
        }
    });
}

function getMoments(req, res, next) {
    return new Promise((resolve, reject) => {
        Moment.find((err, data) => {
            if (err) { reject({ status: 'Error', message: err }) }
            resolve({ status: 'Success', message: 'success', data: data })
        })
    })
}

function deleteMoment(req, res, next) {
    return new Promise((resolve, reject) => {
        Moment.findByIdAndRemove(req.params.id, (err, moment) => {
            if (err) {
                reject({ status: 'Error', message: err })
                return
            }
            if (!moment) {
                reject({ status: 'Error', message: 'category is not valid' })
                return
            }
            resolve({ status: 'Success', message: 'Success', data: moment })
        })
    })
}

function updateMoment(req, res, next) {
    return new Promise((resolve, reject) => {
        Moment.findByIdAndUpdate(req.params.id, req.body, (err, moment) => {
            if (err) {
                reject({ status: 'Error', message: err })
                return
            }
            if (!moment) {
                reject({ status: 'Error', message: 'category is not valid' })
                return
            }
            resolve({ status: 'Success', message: 'Success', data: moment })
        })
    })
}

module.exports = {
    addMoment, getMoments, deleteMoment, updateMoment
}