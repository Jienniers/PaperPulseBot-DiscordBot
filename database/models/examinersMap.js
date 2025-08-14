const mongoose = require('mongoose');

const dynamicSchema = new mongoose.Schema({}, { strict: false });
const DynamicModel = mongoose.model('examinermap', dynamicSchema);

module.exports = DynamicModel;