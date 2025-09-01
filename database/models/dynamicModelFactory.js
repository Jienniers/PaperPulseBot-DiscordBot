const mongoose = require('mongoose');

/**
 * Creates a dynamic Mongoose model with no strict schema enforcement.
 * Useful for collections that act like key-value maps.
 *
 * @param {string} name - The name of the model/collection.
 * @returns {mongoose.Model} - The generated model.
 */
function createDynamicModel(name) {
    const dynamicSchema = new mongoose.Schema({}, { strict: false });
    return mongoose.model(name, dynamicSchema);
}

module.exports = createDynamicModel;