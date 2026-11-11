import { API } from '../api';

import {
  changeAvatarRequestSchema,
  changeAvatarResponseSchema,
  profileResponseSchema,
  type ChangeAvatarRequest,
} from './profile.schema';

class ProfileApi extends API {
  constructor() {
    super('/profile');
  }

  /** Current user with their plans. */
  me() {
    return this.get('', { response: profileResponseSchema });
  }

  changeAvatar(data: ChangeAvatarRequest) {
    return this.post('/change-avatar', {
      data,
      body: changeAvatarRequestSchema,
      response: changeAvatarResponseSchema,
    });
  }
}

export { ProfileApi };
