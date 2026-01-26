import mongoose from 'mongoose';

const PaperRunningMapSchema = new mongoose.Schema({}, { strict: false });

export default mongoose.model('PaperRunningMap', PaperRunningMapSchema);
