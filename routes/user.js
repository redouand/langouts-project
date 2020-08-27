//------MODULES
const express = require('express')
const User_Route = new express.Router();

//------FILES
const UserCon = require('../models/user.model');
const { signUp_Valid, Validation_result } = require('../utils/validator');


//-------Sign up
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



//----------Log in
User_Route.post('/api/login', async (req, res) => {
    try {
        const user = await UserCon.checkLogin(req.body.email, req.body.password);
        const token = await user.genToken();
        res.send({ Token: token, _id: user._id })
    }
    catch (error) {
        res.status(400).send({ Error: error.message })
    }
})




module.exports = User_Route
