import mongoose from 'mongoose';

export default function createDynamicModel(name) {
    const dynamicSchema = new mongoose.Schema({}, { strict: false });
    return mongoose.model(name, dynamicSchema);
}