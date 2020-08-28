const UserCon = require('../models/user.model')
const jwt = require('jsonwebtoken')

const auth = async (req, res, next) => {
    try {
        // TODO:  => Will be Changed back to X-Auth-Token. 
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'willieverbuildthissite?')
        const id = decoded._id
        const user = await UserCon.findById(id)
            .select('-password')

        if (!user) {
            throw new Error()
        }
        req.user = user
    }
    catch (err) {
        console.log(err.message);
        res.status(401).send({ Error: 'Invalid Token, Please Authenticate...' })
    }
    next()
}
module.exports = auth