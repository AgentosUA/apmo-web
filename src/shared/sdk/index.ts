import { AuthApi } from './auth';
import { MissionApi } from './missions';
import { PlanApi } from './plans';
import { ProfileApi } from './profile';
import { SquadsApi } from './squads';
import { UsersApi } from './users';

/** Single entry point: `api.plans.getById({ id })`, `api.auth.signIn(values)`… */
const api = {
  auth: new AuthApi(),
  profile: new ProfileApi(),
  plans: new PlanApi(),
  missions: new MissionApi(),
  squads: new SquadsApi(),
  users: new UsersApi(),
};

export { api };
export { API, http } from './api';
export { tokenStorage } from './token';
export { getApiErrorMessage, isApiError } from './errors';

export * from './auth';
export * from './missions';
export * from './plans';
export * from './profile';
export * from './squads';
export * from './users';
