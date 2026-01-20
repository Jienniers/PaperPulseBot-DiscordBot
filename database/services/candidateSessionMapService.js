import { CandidateSessionMap } from '../models.js';
import { createMapService } from './mapServiceFactory.js';


export default createMapService(CandidateSessionMap, 'CandidateSessionMapService');