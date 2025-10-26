const createDynamicModel = require('./dynamicModelFactory');
const mongoose = require('mongoose');

// Dynamic models
const CandidateSessionMap = createDynamicModel('CandidateSessionMap');
const ExaminersMap = createDynamicModel('ExaminersMap');
const PaperRunningMap = createDynamicModel('PaperRunningMap');
const PaperTimeMins = createDynamicModel('PaperTimeMins');

// Special schema
const paperChannelsSchema = new mongoose.Schema({
    channels: { type: [String], default: [] },
});
const PaperChannels = mongoose.model('PaperChannels', paperChannelsSchema);

module.exports = {
    CandidateSessionMap,
    ExaminersMap,
    PaperRunningMap,
    PaperTimeMins,
    PaperChannels,
};
