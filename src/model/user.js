const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    createTime: Date,
    updateTime: Date,
    name: String,
    encrypted_password: String,
    male: Number,
    age: Number,
    articles: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Articles'
        }
    ]
});

const User = mongoose.model('User', UserSchema);
module.exports = User;