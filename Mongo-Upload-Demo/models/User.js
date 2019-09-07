const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: Schema.Types.String, required: true },
    imageUrl: { type: Schema.Types.ObjectId },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
