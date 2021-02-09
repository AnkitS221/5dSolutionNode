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

function getUserType(userId) {
  return new Promise((resolve, reject) => {
    User.findById(userId, { user_type: 1 }, (err, userData) => {
      if (err) {
        reject("User is not registered");
      }
      resolve(userData);
    });
  });
}

function confirmUser(userData) {
  return new Promise((resolve, reject) => {
    token = userData.params.confirm_token;
    User.findOneAndUpdate(
      { confirm_token: token },
      { is_confirmed: true, confirm_token: "" },
      (err, user) => {
        if (err) {
          reject({ status: "Error", message: err });
        }
        if (!user) {
          reject({ status: "Error", message: "Token is not valid" });
        } else {
          resolve({
            status: "Success",
            message: "Account is successfully confirmed",
          });
        }
      }
    );
  });
}

function getStates(req, res, next) {
  return new Promise((resolve, reject) => {
    const state_list = csc.getStatesOfCountry("101");
    const states = [];
    state_list.forEach((val) => {
      states.push(val.name);
    });
    resolve({ status: true, Data: states });
  });
}

function getCities(req, res, next) {
  return new Promise((resolve, reject) => {
    const state = req.params.state;
    const state_list = csc.getStatesOfCountry("101");
    const states = {};
    state_list.forEach((val) => {
      states[val.id] = val.name;
    });
    const state_id = Object.keys(states).find((key) => states[key] === state);
    const city_list = csc.getCitiesOfState(state_id);
    const cities = [];
    city_list.forEach((val) => {
      cities.push(val.name);
    });
    resolve({ status: true, Data: cities });
  });
}

function forgotPassword(req, res, next) {
  return new Promise((resolve, reject) => {
    User.findOne({ email: req.body.email }, (err, existingUser) => {
      if (err) {
        reject({ status: "Error", message: err });
      }
      if (!existingUser) {
        reject({ status: "Error", message: "Email Id is not registered" });
      } else {
        const token = crypto.randomBytes(16).toString("hex");
        User.findOneAndUpdate(
          { email: req.body.email },
          { forgot_password_token: token },
          (err, doc) => {
            if (err) {
              reject({ status: "Error", message: err });
            }
          }
        );

        const link = `${process.env.FRONT_END}resetPassword/${token}`;
        try {
          var data = fs.readFileSync("./mail_template/reset.html", "utf8");
        } catch (err) { }
        const re = new RegExp("{link}", "g");
        data = data.replace(re, link);
        // data=data.replace(new RegExp(escapeRegExp('{link}}'), 'g'), link);
        sendMail(req.body.email, data)
          .then((res) => {
            resolve("please check your email id to reset password");
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
  });
}

function resetPassword(req, res, next) {
  return new Promise((resolve, reject) => {
    password = req.body.password;
    token = req.params.token;
    User.findOne({ forgot_password_token: token }, (err, existingUser) => {
      if (err) {
        reject({ status: "Error", message: err });
      }
      if (!existingUser) {
        reject({ status: "Error", message: "token is not valid" });
      } else {
        existingUser.password = password;
        existingUser.forgot_password_token = "";
        existingUser.save((err, doc) => {
          if (err) {
            reject({ status: "Error", message: err });
          }
          resolve({
            status: "Success",
            message: "password change successfully",
          });
        });
      }
    });
  });
}

function updateUser(req, res, next) {
  return new Promise((resolve, reject) => {
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, __dirname + "/../public/user_profile/");
      },
      filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
      },
    });

    const fileFilter = (req, file, cb) => {
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
      } else {
        reject({ status: "Error", message: "File must be Image" });
        cb(null, false);
        return;
      }
    };

    const upload = multer({
      storage: storage,
      fileFilter: fileFilter,
    }).single("propic");
    upload(req, null, function (error) {
      if (error)
        resolve({ status: "Error", message: "Error while uploading File" });
      else {
        let file = req.file;
        user = new User(req.body);
        User.findById(req.payload.id, (err, data) => {
          if (err) {
            reject({ status: "Error", message: err });
          } else {
            if (file) {
              if (data.email != user.email) {
                reject({
                  status: "Error",
                  message: "You can not change Email ID",
                });
              }
              if (data.avatar_link != process.env.DEFAULT_PROPIC) {
                try {
                  fs.unlinkSync(__dirname + "/../public/" + data.avatar_link);
                } catch (err) {
                  reject({ status: "Error", message: err });
                  return;
                }
              }
              data.avatar_link = "user_profile/" + file.filename;
            }
            data.first_name = user.first_name;
            data.last_name = user.last_name;
            data.city = user.city;
            data.state = user.state;
            data.postal_code = user.postal_code;
            data.mobile_number = user.mobile_number;
            if (!user.password) {
              reject({ status: "Error", message: "Password is required" });
              return;
            }
            if (data.validatePassword(user.password)) {
              data.password = user.password;
            } else {
              reject({ status: "Error", message: "Password is invalid" });
              return;
            }

            data.save((err, data) => {
              if (err) {
                reject({ status: "Error", message: err });
              }
              resolve({
                status: "Success",
                message: "User details update successfully",
              });
            });
          }
        });
      }
    });
  });
}

function getUserDetails(req, res, next) {
  return new Promise((resolve, reject) => {
    userId = req.payload.id;
    User.findById(
      userId,
      {
        id: 1,
        first_name: 1,
        last_name: 1,
        mobile_number: 1,
        email: 1,
        avatar_link: 1,
        city: 1,
        state: 1,
        postal_code: 1,
      },
      (err, data) => {
        if (err) {
          reject({ status: "Error", message: err });
        }
        resolve({ status: "Success", message: "success", data: data });
      }
    );
  });
}

module.exports = {
  login,
  registerUser,
  getUserType,
  confirmUser,
  getStates,
  getCities,
  forgotPassword,
  resetPassword,
  updateUser,
  getUserDetails,
};
