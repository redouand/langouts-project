//------MODULES
const express = require('express')
const User_Route = new express.Router();

//------FILES
const UserCon = require('../models/user.model');
const { signUp_Valid, Validation_result } = require('../utils/validator');


User_Route.post('/api/sign-up', signUp_Valid, async (req, res) => {
    try {
        Validation_result(req);
        const user = new UserCon(req.body);
        await user.crypting();
        const token = await user.genToken();
        await user.save();
        res.send({ Token: token, _id: user._id });
    }
    catch (error) {
        const Errors = error.message.split('.,');
        res.status(400).send({ Errors })
    };
})



module.exports = User_Route
