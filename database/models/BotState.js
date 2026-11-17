import mongoose from 'mongoose';

// Legacy model retained for the one-time migration from the old global document.
const BotStateSchema = new mongoose.Schema(
    {
        _id: { type: String, default: 'global' },
        state: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { collection: 'botstates' },
);

export default mongoose.models.BotState ?? mongoose.model('BotState', BotStateSchema);
