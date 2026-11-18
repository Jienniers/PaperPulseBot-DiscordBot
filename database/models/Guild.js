import mongoose from 'mongoose';

const GuildSchema = new mongoose.Schema(
    { _id: { type: String, required: true } },
    { collection: 'guilds', strict: false, versionKey: false },
);

export default mongoose.models.Guild ?? mongoose.model('Guild', GuildSchema);
