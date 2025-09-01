const { PaperRunningMap } = require('../models');
const { createMapService } = require('./mapServiceFactory');

module.exports = createMapService(PaperRunningMap, 'PaperRunningMapService');