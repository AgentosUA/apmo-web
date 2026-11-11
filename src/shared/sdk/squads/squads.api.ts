import { z } from 'zod';

import { API } from '../api';

import {
  searchSquadsResponseSchema,
  squadFormSchema,
  squadResponseSchema,
  squadsResponseSchema,
  type SquadForm,
} from './squads.schema';

const path = (id: string) => `/${encodeURIComponent(id)}`;

class SquadsApi extends API {
  constructor() {
    super('/squads');
  }

  /** Squads the current user owns or is a member of. */
  my() {
    return this.get('/my', { response: squadsResponseSchema });
  }

  search(query: string, signal?: AbortSignal) {
    return this.get('/search', {
      params: { q: query.trim() },
      response: searchSquadsResponseSchema,
      signal,
    });
  }

  getById(id: string) {
    return this.get(path(id), { response: squadResponseSchema });
  }

  create(data: SquadForm) {
    return this.post('', { data, body: squadFormSchema, response: squadResponseSchema });
  }

  update(id: string, data: SquadForm) {
    return this.patch(path(id), { data, body: squadFormSchema, response: squadResponseSchema });
  }

  remove(id: string) {
    return this.delete(path(id), { response: z.unknown() });
  }

  addMember(id: string, userId: string) {
    return this.post(`${path(id)}/members`, { data: { userId }, response: squadResponseSchema });
  }

  /** The owner removes a member, or a member leaves (own id). */
  removeMember(id: string, userId: string) {
    return this.delete(`${path(id)}/members/${encodeURIComponent(userId)}`, {
      response: squadResponseSchema,
    });
  }

  uploadLogo(id: string, logo: File) {
    return this.post(`${path(id)}/logo`, {
      data: { logo },
      response: squadResponseSchema,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  removeLogo(id: string) {
    return this.delete(`${path(id)}/logo`, { response: squadResponseSchema });
  }
}

export { SquadsApi };
