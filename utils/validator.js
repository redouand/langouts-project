const UserCon = require('../models/user.model')
const { check, validationResult } = require('express-validator');

const signUp_Valid = [

    check('first').not().isEmpty().withMessage('First Name is Required.')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 letters.')
        .customSanitizer(value => {
            return value.charAt(0).toUpperCase() + value.slice(1)
        }),


    check('second').not().isEmpty().withMessage('Second Name is Required.')
        .isLength({ min: 3 }).withMessage('second name must be at least 3 letters.')
        .customSanitizer(value => {
            return value.charAt(0).toUpperCase() + value.slice(1)
        }),


    check('password').not().isEmpty().withMessage('Password is required.')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,16}$/)
        .withMessage('6-16 letters, 1 number, uppercase and lowercase.'),


    check('email').not().isEmpty().withMessage('Email Required.')
        .isEmail().withMessage('invalid Email.')
        .custom(async (value) => {
            const user = await UserCon.findOne({ email: value })
            if (user) {
                return Promise.reject('E-mail already in use.');
            }
        })

]

const editValidator = [

    check('first').optional({ nullable: true }).isLength({ min: 3 }).withMessage('Name must be at least 3 letters.')
        .customSanitizer(value => {
            if (value) {
                return value.charAt(0).toUpperCase() + value.slice(1)
            }
        }),


    check('second').optional({ nullable: true }).isLength({ min: 3 }).withMessage('second name must be at least 3 letters.')
        .customSanitizer(value => {
            if (value) {
                return value.charAt(0).toUpperCase() + value.slice(1)
            }
        }),


    check('password').optional({ nullable: true }).matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,16}$/)
        .withMessage('6-16 letters, 1 number, uppercase and lowercase.'),
]

const Validation_result = (req) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let Errors = []
        const errArry = errors.array()
        for (let i = 0; i < errArry.length; i++) {
            const errObj = errArry[i];
            Errors.push(errObj.msg)
        }
        throw new Error(Errors)
    }
}

module.exports = {
    signUp_Valid,
    editValidator,
    Validation_result
}