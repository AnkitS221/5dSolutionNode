const mongoose = require('mongoose'),
  crypto = require('crypto'),
  uniqueValidator = require('mongoose-unique-validator'),
  deepPopulate = require('mongoose-deep-populate')(mongoose),
  jwt = require('jsonwebtoken'),
  Schema = mongoose.Schema

const UserSchema = new Schema({
  first_name: {
    type: String,
    trim: true,
    select: true,
    required: [true, 'Name is required'],
    match: [/^[A-Za-z\s]{1,15}$/, props => (`${props.value} - Name must be 1 to 15 Characters long`)]
  },
  last_name: {
    type: String,
    trim: true,
    default: '',
    match: [/^[A-Za-z\s]{1,15}$/, props => (`${props.value} - Last name must be 1 to 15 Characters long`)]
  },
  mobile_number: {
    type: String,
    trim: true,
    unique: true,
    select: true,
    required: [true, 'Mobile number is required'],
    match: [/^\d{10}$/, props => (`${props.value} is not a valid Phone number!`)]
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    select: true,
    required: [true, 'Email is required'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, props => (`${props.value} is not a valid Email!`)]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: true,
    match: [/^(?=.*\d)(?=.*[a-z])(?=.*[~`!@#$%^&*()+_=\\|[\]{}:;"'?/,.<>-])(?=.*[A-Z]).{8,16}$/, props => `Password must have special char, number and one capital`]
  },
  city: {
    type: String,
    required: [true, 'city is required'],
    select: true,
    match: [/^[A-Za-z\s]{1,60}$/, props => (`${props.value} is not a valid City name!`)]
  },
  encrypt_key: {
    type: String,
    select: false
  },
},
  {
    timestamps: { createdAt: true, updatedAt: true }
  })

/**
 * Password hash middleware.
 */
UserSchema.pre('save', function save(next) {
  const user = this
  password = user.password
  if ((password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[~`!@#$%^&*()+_=\\|[\]{}:;"'?/,.<>-])(?=.*[A-Z]).{8,16}$/))) {
    this.encrypt_key = crypto.randomBytes(16).toString('hex')
    this.password = crypto.pbkdf2Sync(password, this.encrypt_key, 10000, 512, 'sha512').toString('hex')
    next()
  } else {
    next({ code: 500, error: 'password must contains 8 char with special char,small later,capital later and a number' })
  }
})

UserSchema.methods.toLoginJSON = function () {
  return {
    userData: {
      _id: this._id,
      email: this.email,
      first_name: this.first_name,
      last_name: this.last_name,
      mobile_number: this.mobile_number,
      user_type: this.user_type,
      avatar_link: this.avatar_link,
      city: this.city,
      state: this.state,
      country: this.country,
      is_confirmed: this.is_confirmed
    },
  }
}

UserSchema.methods.validatePassword = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.encrypt_key, 10000, 512, 'sha512').toString('hex')
  return this.password === hash
}

UserSchema.
  plugin(deepPopulate).
  plugin(uniqueValidator, { message: '{VALUE} is already registred.' })

module.exports = mongoose.model('User', UserSchema)
