const mongoose = require('mongoose')

const Conversation = new mongoose.Schema({
    dateCreated: {
        type: Date,
        default: Date.now()
    },
    participants: { // stores user Ids
        type: [String],
        default: [],
        required: 'Conversation must include participants'
    },
    messages: {
        type: [Object],
        default: [],
    }
    
})

module.exports = Conversation