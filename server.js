//---------MODULES
const express = require('express')
const app = express()
const chalk = require('chalk')

//--------FILES
const User_Route = require('./routes/user')
const Profile_set_Route = require('./routes/profile-set')

//--------MongoDb Connection
require('./config/db')

//--------EXPRESS CONFIG
app.use(express.json())

//--------API ROUTES
app.use(User_Route)
app.use(Profile_set_Route)



//-------SERVER LISTEN
const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(chalk.bold.magentaBright('Server On Port ') + chalk.black.bgWhite(port))
})