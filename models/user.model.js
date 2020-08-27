//-------MODULES
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


//------SCHEMA MODEL
const User_schema = new mongoose.Schema({
    first: {
        type: String,
        required: true,
        trim: true,
    },
    second: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 7
    },
    date: {
        type: Date,
        default: Date.now
    }
})

//----------HASHING PASSWORD (Bcrypt)
User_schema.methods.crypting = async function () {
    const hashed = await bcrypt.hash(this.password, 8)
    this.password = hashed
}

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


//-----------EXPORTS
const UserCon = mongoose.model('user', User_schema)
module.exports = UserCon