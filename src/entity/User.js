"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
Promise.resolve().then(function () { return require('./Post'); });
var UserSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    fullname: {
        type: String
    },
    email: {
        type: String
    },
    mobile: {
        type: String
    },
    posts: [{ type: mongoose_1.Types.ObjectId, ref: 'Post' }],
    token: String
});
var UserModel = mongoose_1.model('User', UserSchema);
exports.default = UserModel;
