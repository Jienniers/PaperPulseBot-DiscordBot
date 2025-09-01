const { CandidateSessionMap } = require('../models');
const { createMapService } = require('./mapServiceFactory');

module.exports = createMapService(CandidateSessionMap, 'CandidateSessionMapService');