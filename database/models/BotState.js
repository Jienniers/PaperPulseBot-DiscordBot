import mongoose from 'mongoose';

const BotStateSchema = new mongoose.Schema({
    _id: { type: String, default: 'global' },
    state: { type: Object, default: {} },
});

export default mongoose.model('BotState', BotStateSchema);
