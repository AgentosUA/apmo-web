import { API } from '../api';

import {
  parseMissionRequestSchema,
  parseMissionResponseSchema,
  parseMissionUrlRequestSchema,
  type ParseMissionRequest,
  type ParseMissionUrlRequest,
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

  /** Parses a .pbo by link; the API downloads it (only from its allow-list). */
  parseUrl(data: ParseMissionUrlRequest) {
    return this.post('/parse-url', {
      data,
      body: parseMissionUrlRequestSchema,
      response: parseMissionResponseSchema,
    });
  }
}

export { MissionApi };
