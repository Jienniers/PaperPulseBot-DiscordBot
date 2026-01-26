import mongoose from 'mongoose';

const PaperTimeMinsSchema = new mongoose.Schema({}, { strict: false });

export default mongoose.model('PaperTimeMins', PaperTimeMinsSchema);
