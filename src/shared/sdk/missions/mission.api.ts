import { API } from '../api';

import {
  parseMissionRequestSchema,
  parseMissionResponseSchema,
  type ParseMissionRequest,
} from './mission.schema';

class MissionApi extends API {
  constructor() {
    super('/missions');
  }

  /** Uploads a `mission.sqm` and returns the parsed mission. */
  parse(data: ParseMissionRequest) {
    return this.post('/parse', {
      data,
      body: parseMissionRequestSchema,
      response: parseMissionResponseSchema,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}

export { MissionApi };
