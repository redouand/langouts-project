//-------MODULES
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


//------SCHEMA MODEL
const User_schema = new mongoose.Schema({
    first: {
        type: String,
        trim: true,
    },
    second: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        minlength: 7
    },
    date: {
        type: Date,
        default: Date.now
    }
})

//------------ Pre Mongoose MiddleWare (Hashing Password)
User_schema.pre('save', async function (next) {
    if (this.isModified('password')) { this.password = await bcrypt.hash(this.password, 8) }
    next()
})

//---------Generate Json Web Token (jwt)
User_schema.methods.genToken = async function () {
    const token = await jwt.sign({ _id: this._id }, 'willieverbuildthissite?')
    return token
}

//--------Check Login
User_schema.statics.checkLogin = async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error('No user by that email.')
    const isPass = await bcrypt.compare(password, user.password)
    if (!isPass) throw new Error('Password incorrect.')
    return user
}

//-------------RETURN IMPORTANT ONLY
User_schema.methods.importantOnly = function () {
    const user = this.toObject()
    delete user.password
    delete user.__v
    return user
}

//-----------EXPORTS
const UserCon = mongoose.model('user', User_schema)
module.exports = UserCon