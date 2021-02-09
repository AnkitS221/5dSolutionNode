const mongoose = require('mongoose'),
    crypto = require('crypto'),
    uniqueValidator = require('mongoose-unique-validator'),
    deepPopulate = require('mongoose-deep-populate')(mongoose),
    jwt = require('jsonwebtoken'),
    Schema = mongoose.Schema

const momentSchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Title is required'],
    },
    comment: {
        type: String,
        trim: true,
        required: [true, 'Comment is required'],
    },
    fileName: {
        type: String,
    },
    tags: {
        type: [String],
        required: true
    },
},
    {
        timestamps: { createdAt: true, updatedAt: true }
    })

momentSchema.
    plugin(deepPopulate).
    plugin(uniqueValidator, { message: '{VALUE} is already registred.' })

module.exports = mongoose.model('Moments', momentSchema)