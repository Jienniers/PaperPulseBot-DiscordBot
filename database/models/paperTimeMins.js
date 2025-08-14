const mongoose = require('mongoose');

const dynamicSchema = new mongoose.Schema({}, { strict: false }); // allow dynamic keys
const DynamicModel = mongoose.model('papertimemins', dynamicSchema);

module.exports = DynamicModel;