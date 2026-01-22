import { ExaminersMap } from '../models/index.js';
import { createMapService } from './mapServiceFactory.js';

export default createMapService(ExaminersMap, 'ExaminerMapService');
