const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const todosSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    img: {
        type: Object,
        required: false
    }
}, {
    timestamps: true
});

module.exports = User = mongoose.model('todos', todosSchema);