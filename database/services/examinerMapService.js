import { ExaminersMap } from '../models.js';
import { createMapService } from './mapServiceFactory.js';


export default createMapService(ExaminersMap, 'ExaminerMapService');