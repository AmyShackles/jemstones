const mongoose = require('mongoose');

module.exports = {
    connectTo: function(mongo_uri) {
        return mongoose.connect(mongo_uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
    }
}