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

// //----------HASHING PASSWORD (Bcrypt)
// User_schema.methods.crypting = async function () {
//     const hashed = await bcrypt.hash(this.password, 8)
//     this.password = hashed
// }

//---------Generate Json Web Token (jwt)
User_schema.methods.genToken = async function () {
    const token = await jwt.sign({ _id: this._id }, 'willieverbuildthissite?')
    return token
}

//--------Check Credentials
User_schema.statics.checkLogin = async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error('No user by that email.')
    const isPass = await bcrypt.compare(password, user.password)
    if (!isPass) throw new Error('Password incorrect.')
    return user
}

//------------ Pre MiddleWare
User_schema.pre('save', async function (next) {
    if (this.isModified('password')) { this.password = await bcrypt.hash(this.password, 8) }
    next()
})

//-----------EXPORTS
const UserCon = mongoose.model('user', User_schema)
module.exports = UserCon