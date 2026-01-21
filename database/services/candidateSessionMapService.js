import { CandidateSessionMap } from '../models/index.js';
import { createMapService } from './mapServiceFactory.js';

export default createMapService(CandidateSessionMap, 'CandidateSessionMapService');
