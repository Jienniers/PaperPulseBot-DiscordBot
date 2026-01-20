import { PaperRunningMap } from '../models.js';
import { createMapService } from './mapServiceFactory.js';


export default createMapService(PaperRunningMap, 'PaperRunningMapService');