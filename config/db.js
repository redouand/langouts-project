const mongoose = require('mongoose')
const chalk = require('chalk')
const URI = 'mongodb://127.0.0.1:27017/Treffens-db'

// const URI = 'mongodb+srv://db_user_treffens_dev:newlife47@treffens-cluster-dev.elwbj.mongodb.net/Treffens-cluster-dev?retryWrites=true&w=majority'

mongoose.connect(URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => console.log(chalk.cyan.bold('Treffens DB connected!')))

module.exports = mongoose