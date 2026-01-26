import mongoose from 'mongoose';

const ExaminersMapSchema = new mongoose.Schema({}, { strict: false });

export default mongoose.model('ExaminersMap', ExaminersMapSchema);
