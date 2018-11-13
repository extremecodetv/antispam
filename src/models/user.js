const mongoose = require('mongoose')

const model = mongoose.Schema({
  telegram_id: { type: Number, required: true },
  username: { type: String },
  created_at: { type: Date, default: Date.now() },
  isNewFag: { type: Boolean, default: true }
})

module.exports = mongoose.model('User', model)
