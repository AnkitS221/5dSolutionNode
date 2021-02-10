const User = require("../models/user_model");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const fs = require("fs");
const csc = require("country-state-city").default;
const multer = require("multer");
const url = require("url");

function registerUser(userData, res, next) {
  return new Promise((resolve, reject) => {
    try {
      const user = new User(userData.body);
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
          resolve({ status: "Success", data: userData.body });
        }
      });
    } catch (error) {
    }
  });
}

function login(userData, res, next) {
  return new Promise((resolve, reject) => {
    let user = userData.body;
    console.log(userData.body);
    if (!user.email) {
      reject({ status: "Error", message: "Email Id is required" });
      return;
    }

    if (!user.password) {
      reject({ status: "Error", message: "Password Id is required" });
      return;
    }
    try {
      User.findOne({ email: user.email }, { encrypt_key: 1 }, (err, userDb) => {
        if (userDb != null && userDb != undefined) {
          let isValidated = userDb.validatePassword(user.password);
          if (isValidated) {
            resolve({ status: 'Success', message: 'Login Successful', data: userDb.toLoginJSON() })
          } else {
            reject({ status: "Error", message: "Password is incorrect" });
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
}

module.exports = {
  login,
  registerUser
};
