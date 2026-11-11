import { API } from '../api';

import {
  changeAvatarRequestSchema,
  changeAvatarResponseSchema,
  profilePlansQuerySchema,
  profilePlansResponseSchema,
  profileResponseSchema,
  removeAvatarResponseSchema,
  uploadAvatarRequestSchema,
  uploadAvatarResponseSchema,
  type ChangeAvatarRequest,
  type ProfilePlansQuery,
  type UploadAvatarRequest,
} from './profile.schema';

class ProfileApi extends API {
  constructor() {
    super('/profile');
  }

  /** Current user with their plans. */
  me() {
    return this.get('', { response: profileResponseSchema });
  }

  /** The user's plans, filtered and sorted on the server. */
  plans(query: ProfilePlansQuery, signal?: AbortSignal) {
    const { search, world, sort, order } = profilePlansQuerySchema.parse(query);

    return this.get('/plans', {
      params: { search: search || undefined, world: world || undefined, sort, order },
      response: profilePlansResponseSchema,
      signal,
    });
  }

  /** Sets an external image URL as the avatar. */
  changeAvatar(data: ChangeAvatarRequest) {
    return this.post('/change-avatar', {
      data,
      body: changeAvatarRequestSchema,
      response: changeAvatarResponseSchema,
    });
  }

  /** Uploads an image to the storage and makes it the avatar. */
  uploadAvatar(data: UploadAvatarRequest) {
    return this.post('/avatar', {
      data,
      body: uploadAvatarRequestSchema,
      response: uploadAvatarResponseSchema,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  /** Resets to the default avatar (and deletes an uploaded one). */
  removeAvatar() {
    return this.delete('/avatar', { response: removeAvatarResponseSchema });
  }
}

export { ProfileApi };
