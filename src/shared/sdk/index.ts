import { AuthApi } from './auth';
import { MissionApi } from './missions';
import { PlanApi } from './plans';
import { ProfileApi } from './profile';

/** Single entry point: `api.plans.getById({ id })`, `api.auth.signIn(values)`… */
const api = {
  auth: new AuthApi(),
  profile: new ProfileApi(),
  plans: new PlanApi(),
  missions: new MissionApi(),
};

export { api };
export { API, http } from './api';
export { tokenStorage } from './token';
export { getApiErrorMessage, isApiError } from './errors';

export * from './auth';
export * from './missions';
export * from './plans';
export * from './profile';
