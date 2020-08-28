//------MODULES
const express = require('express')
const Audio_Route = new express.Router();
const multer = require('multer')
const { join } = require('path')
const { createReadStream, unlink } = require('fs')

//-------FILES
const auth = require('../utils/auth');
const UserCon = require('../models/user.model');


//------MUlter Config
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, join(__dirname, '../GCP/audio'))
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })
})

//--------UPLOAD AUDIO
Audio_Route.post('/api/upload-spoken-bio', auth, upload.single('voice'), async (req, res) => {
    const id = req.user._id
    try {
        const user = await UserCon.findById(id)
        // FIXME:  => LINK
        user.audio = `http://localhost:8080/users/${id}/spoken-bio`
        await user.save()
        res.send({ Status: 'success' })
    }
    catch (err) {
        res.status(err.status).send({ Error: err.message })
    }
})


//--------Retrieve Audio through LINK
Audio_Route.get('/users/:id/spoken-bio', async (req, res) => {
    const audioPath = join(__dirname, `../GCP/audio/${req.params.id}.mp3`)
    res.writeHead(200, { 'Content-Type': 'audio/mp3' })
    createReadStream(audioPath).pipe(res)
})




//---------Delete Avatar
Audio_Route.post('/api/delete-spoken-bio', auth, async (req, res) => {
    const id = req.user._id
    const Path = join(__dirname, `../GCP/audio/${id}.mp3`)
    //----Delete audio from disk
    await unlink(Path, (err) => {
        if (err) {
            res.set({ 'Content-Type': 'application/json' })
            res.status(404).send({ Error: 'Spoken bio not found.' })
        }
    })

    try {
        //----Set spoken bio Back to N/A
        const user = await UserCon.findById(id)
        user.audio = 'N/A'
        await user.save()
        res.send({ Status: 'success' })
    }
    catch (err) {
        console.log(err);
        res.status(err.status).send({ Error: err.message })
    }
})



module.exports = Audio_Route