import { API } from '../api';

import { searchUsersResponseSchema } from './users.schema';

class UsersApi extends API {
  constructor() {
    super('/users');
  }

  /** By username (substring), without the current user. Max 10. */
  search(query: string, signal?: AbortSignal) {
    return this.get('/search', {
      params: { q: query.trim() },
      response: searchUsersResponseSchema,
      signal,
    });
  }
}

export { UsersApi };
