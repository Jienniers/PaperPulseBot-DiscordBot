const mongoose = require('mongoose');

function createDynamicModel(name) {
    const dynamicSchema = new mongoose.Schema({}, { strict: false });
    return mongoose.model(name, dynamicSchema);
}

module.exports = createDynamicModel;
