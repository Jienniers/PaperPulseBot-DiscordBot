const mongoose = require('mongoose');

const dynamicSchema = new mongoose.Schema({}, { strict: false });
const DynamicModel = mongoose.model('candidateSessionMap', dynamicSchema);

module.exports = DynamicModel;