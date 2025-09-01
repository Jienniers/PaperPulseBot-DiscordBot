const { PaperTimeMins } = require('../models');
const { createMapService } = require('./mapServiceFactory');

module.exports = createMapService(PaperTimeMins, 'PaperTimeMinsService');