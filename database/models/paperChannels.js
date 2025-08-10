const mongoose = require('mongoose');

const paperChannelsSchema = new mongoose.Schema({
    channels: {
        type: [String],
        default: [],
    },
});

const PaperChannels = mongoose.model('PaperChannels', paperChannelsSchema);

module.exports = PaperChannels;