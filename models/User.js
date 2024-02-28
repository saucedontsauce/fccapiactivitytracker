
const mongoose = require('mongoose');



const UserSchema = new mongoose.Schema({ 
  username: String,
  log: [{ _id: false,
    description: {type:String},
   date:{type: String},
   duration:{type: Number}}]
});

const User = mongoose.model('User', UserSchema);

module.exports = User