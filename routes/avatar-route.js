//------MODULES
const multer = require('multer')
const express = require('express')
const Avatar_Route = new express.Router();
const { join } = require('path')
const sharp = require('sharp')
const { createReadStream, unlink } = require('fs')

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
Avatar_Route.post('/api/upload-avatar', auth, upload.single('avatar'), async (req, res) => {
    const savePath = join(__dirname, `../GCP/images/${req.user._id}.jpeg`);
    try {
        const uploaded = await sharp(req.file.path).resize(500, 500).jpeg().toFile(savePath)
        const user = await UserCon.findById(req.user._id)
        // FIXME:  => LINK
        user.avatar = `http://localhost:8080/users/${req.user._id}/avatar`
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
Avatar_Route.get('/users/:id/avatar', async (req, res) => {
    const Path = join(__dirname, `../GCP/images/${req.params.id}.jpeg`)

    createReadStream(Path)
        //  =>  listening to error Old School..
        .on("error", (err) => {
            res.set({ 'Content-Type': 'application/json' })
            res.status(404).send({ Error: 'not found' })
        })
        //------Success
        .pipe(res)
})


//---------Delete Avatar
Avatar_Route.post('/api/delete-avatar', auth, async (req, res) => {
    const id = req.user._id
    const Path = join(__dirname, `../GCP/images/${id}.jpeg`)
    //----Delete photo from disk
    await unlink(Path, (err) => {
        if (err) {
            res.set({ 'Content-Type': 'application/json' })
            res.status(404).send({ Error: 'Image not found.' })
        }
    })

    try {
        //----Set avatar Back to N/A
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

module.exports = Avatar_Route