import { PaperRunningMap } from '../models/index.js';
import { createMapService } from './mapServiceFactory.js';

export default createMapService(PaperRunningMap, 'PaperRunningMapService');
