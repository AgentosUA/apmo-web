import { API } from '../api';

import {
  createPlanRequestSchema,
  deletePlanResponseSchema,
  planResponseSchema,
  updatePlanRequestSchema,
  type CreatePlanRequest,
  type PlanId,
  type UpdatePlanRequest,
} from './plan.schema';

class PlanApi extends API {
  constructor() {
    super('/plans');
  }

  create(data: CreatePlanRequest) {
    return this.post('', { data, body: createPlanRequestSchema, response: planResponseSchema });
  }

  update({ id, ...data }: UpdatePlanRequest & PlanId) {
    return this.patch(`/${encodeURIComponent(id)}`, {
      data,
      body: updatePlanRequestSchema,
      response: planResponseSchema,
    });
  }

  getById({ id }: PlanId) {
    return this.get(`/${encodeURIComponent(id)}`, { response: planResponseSchema });
  }

  remove({ id }: PlanId) {
    return this.delete(`/${encodeURIComponent(id)}`, { response: deletePlanResponseSchema });
  }
}

export { PlanApi };
