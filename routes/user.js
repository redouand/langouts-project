//------MODULES
const express = require('express')
const User_Route = new express.Router();
const { join } = require('path')
const { unlink } = require('fs')

//------FILES
const UserCon = require('../models/user.model');
const { signUp_Valid, Validation_result, editValidator } = require('../utils/validator');
const auth = require('../utils/auth');


//-------Sign up
User_Route.post('/api/sign-up', signUp_Valid, async (req, res) => {
    try {
        Validation_result(req);
        const user = new UserCon(req.body);
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


//-------------Edit Account
User_Route.patch('/api/edit-account', auth, editValidator, async (req, res) => {
    const allowed = ['first', 'second', 'password']
    const desiredProps = Object.keys(req.body);
    const isValidOperation = desiredProps.every((singleDesired) => allowed.includes(singleDesired))
    const user = req.user
    try {
        if (!isValidOperation) { throw new Error('Invalid Operation.') }
        Validation_result(req)

        desiredProps.forEach(singleDesired => {
            if (req.body[singleDesired] !== null) {
                user[singleDesired] = req.body[singleDesired]
            }
        })

        await user.save()
        //--------return important only
        const returnedUser = await user.importantOnly()

        res.status(201)
        res.send(returnedUser)
    }
    catch (error) {
        const Errors = error.message.split('.,');
        res.status(400).send({ Errors })
    }
})


//------------Delete account
User_Route.delete('/api/delete-account', auth, async (req, res) => {
    const id = req.user._id
    try {
        const deleted = await UserCon.findByIdAndDelete(id);
        if (deleted.avatar !== 'N/A') unlink(join(__dirname, `../GCP/images/${id}.jpeg`), () => null)
        if (deleted.audio !== 'N/A') unlink(join(__dirname, `../GCP/audio/${id}.mp3`), () => null)

        res.send({ Status: 'Success' })
    }
    catch (error) {
        console.log(err);
        res.status(500).send({ Error: error.message })
    }
})


//------------Get user data (Mine)
User_Route.get('/api/get-user-info', auth, async (req, res) => {
    const id = req.user._id
    try {
        const userInfo = await UserCon.findById(id);
        const returnedUser = await userInfo.importantOnly()
        res.send(returnedUser)
    }
    catch (error) {
        res.status(500).send({ Error: error.message })
    }
})

///-----------Get Any user Data
User_Route.get('/api/users/:id', async (req, res) => {
    const id = req.params.id
    try {
        const user = await UserCon.findById(id)
        const returnedUser = user.importantOnly()
        delete returnedUser.email
        res.send(returnedUser)
    }
    catch (err) {
        res.status(404).send({ Error: 'User not found.' })
    }
})

module.exports = User_Route

