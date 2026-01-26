import mongoose from 'mongoose';

const PaperChannelsSchema = new mongoose.Schema({
    channels: { type: [String], default: [] },
});

export default mongoose.model('PaperChannels', PaperChannelsSchema);
