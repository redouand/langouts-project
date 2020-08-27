//------MODULES
const multer = require('multer')
const express = require('express')
const Uploads_Route = new express.Router();
const path = require('path')
const sharp = require('sharp')
const fs = require('fs')

//------FILES
const auth = require('../utils/auth');
const UserCon = require('../models/user.model')



//--------Multer Config
var upload = multer({
    storage: multer.diskStorage({}),
    limits: {
        files: 1,
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|PNG|jpg|jpeg|GIF)$/)) {
            return cb(new Error('Format not supported, please upload an image.'))
        }
        else cb(undefined, true)
    }
})

//------UPLOAD IMAGE
Uploads_Route.post('/api/upload-avatar', auth, upload.single('avatar'), async (req, res) => {
    const savePath = path.join(__dirname, `../GCP/images/${req.user._id}.jpeg`);
    try {
        const uploaded = await sharp(req.file.path).resize(500, 500).jpeg().toFile(savePath)
        const user = await UserCon.findById(req.user._id)
        user.avatar = `https://treffens.com/users/${req.user._id}/avatar`
        await user.save()
        res.send({ Status: 'success' })
    }
    catch (error) {
        res.status(500).send({ Error: error.message })
    }
},
    //---------MULTER ERROR HANDLING
    (error, req, res, next) => {
        res.status(400).send({ Error: error.message })
    })


//---------SERVE UPLOADED AVATAR (GET)
Uploads_Route.get('/users/:id/avatar', async (req, res) => {
    const Path = path.join(__dirname, `../GCP/images/${req.params.id}.jpeg`)

    fs.createReadStream(Path)
        //  =>  listening to error Old School..
        .on("error", (err) => {
            res.set({ 'Content-Type': 'application/json' })
            res.status(404).send({ Error: 'not found' })
        })
        //------Success
        .pipe(res)
})


//---------Delete Avatar
Uploads_Route.post('/api/delete-avatar', auth, async (req, res) => {
    const id = req.user._id
    const Path = path.join(__dirname, `../GCP/images/${id}.jpeg`)
    await fs.unlink(Path, (err) => {
        if (err) {
            res.set({ 'Content-Type': 'application/json' })
            res.status(404).send({ Error: 'Image not found.' })
        }
    })

    try {
        const user = await UserCon.findById(id)
        user.avatar = 'N/A'
        await user.save()
        res.send({ Status: 'success' })
    }
    catch (err) {
        console.log(err);
        res.status(err.status).send({ Error: err.message })
    }
})

module.exports = Uploads_Route