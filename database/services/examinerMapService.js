const { ExaminersMap } = require('../models');
const { createMapService } = require('./mapServiceFactory');

module.exports = createMapService(ExaminersMap, 'ExaminerMapService');
