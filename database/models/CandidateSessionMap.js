import mongoose from 'mongoose';

const CandidateSessionMapSchema = new mongoose.Schema({}, { strict: false });

export default mongoose.model('CandidateSessionMap', CandidateSessionMapSchema);
