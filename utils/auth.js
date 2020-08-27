const UserCon = require('../models/user.model')
const jwt = require('jsonwebtoken')

const auth = async (req, res, next) => {
    try {
        const token = req.header('X-Auth-Token')
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