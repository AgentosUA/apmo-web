import cookieCutter from 'cookie-cutter';

import { Mission } from '@/entities/mission/types';

import axios, { AxiosPromise, AxiosResponse } from 'axios';
import { headers } from 'next/headers';

type DataType =
  | 'Number'
  | 'Object'
  | 'Side'
  | 'Group'
  | 'Marker'
  | 'String'
  | 'Code'
  | 'Config'
  | 'Control'
  | 'Display'
  | 'Location'
  | 'Script Handle'
  | 'Structured Text'
  | 'Diary Record'
  | 'Task'
  | 'Team Member'
  | 'Namespace'
  | 'Editor Object'
  | 'Eden ID'
  | 'Eden Entity'
  | 'NaN'
  | 'HashMap'
  | 'HashMapKey';

type Side =
  | 'West'
  | 'East'
  | 'Independent'
  | 'Civilian'
  | 'Empty'
  | 'BLUFOR'
  | 'OPFOR'
  | 'Logic'
  | 'Unknown';

type Entities = Record<string, EntityItem> & { items: number };

type EntityItem = {
  dataType: DataType;
  Entities: Entities;
  PositionInfo: {
    position: [number, number, number];
    angles: [number, number, number];
  };
  side: Side;

  flags: number;
  Attributes: {
    rank?: string; // 'SERGEANT';
    init?: string; // 'call{[this, "USMC", "SL"] call compile preprocessFileLineNumbers "process_units.sqf";}';
    description: string;
    isPlayable: 1 | 0 | number;
    Inventory?: object;
  };
  id: number;
  type: string;
  angle?: number;
  fillName?: string;
  colorName?: string;
  a?: number;
  b?: number;
  position?: number[];
  markerType?: string;
  atlOffset: 0.00072097778;
  CustomAttributes: {
    Attribute0: {
      property: 'speaker';
      expression: '_this setspeaker _value;';
      Value: {
        data: {
          singleType: 'STRING';
          value: 'Male06ENG';
        };
      };
    };
    Attribute1: {
      property: 'pitch';
      expression: '_this setpitch _value;';
      Value: {
        data: {
          singleType: 'SCALAR';
          value: 0.98000002;
        };
      };
    };
    nAttributes: 2;
  };
};

type CreatePlanDto = {
  title: string;
  planMarkers: string;
  mission: Mission | null;
};

type GetPlanByIdDto = {
  id: string;
};

type Plan = {
  id: string;
  title: string;
  mission: Mission;
  planMarkers: string;
};

type LoginDto = {
  email?: string;
  username?: string;
  password: string;
};

type LoginResponse = {
  token: string;
  refreshToken: string;
};

type SignUpDto = {
  email: string;
  username: string;
  password: string;
};

type ChangePasswordDto = { oldPassword: string; newPassword: string };

type RefreshTokenDto = {
  refreshToken: string;
};

type User = {
  id: string;
  email: string;
  username: string;
  avatar: string | null;
  squadTag: string | null;
  plans: Plan[];
};

const instance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apmoApi = {
  mission: {
    parse: async (mission: File) => {
      return instance.post<Mission>(
        '/missions/parse',
        {
          file: mission,
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    },
  },
  plan: {
    createPlan: async (data: CreatePlanDto) => {
      return instance.post<Plan>('/plans', data);
    },

    getPlanById: async (data: GetPlanByIdDto) => {
      return instance.get<Plan>(`/plans/${data.id}`);
    },
    delete: async (data: GetPlanByIdDto) => {
      return instance.delete(`/plans/${data.id}`);
    },
  },
  user: {
    get: async () => {
      return instance.get<User>('/profile');
    },
    login: async (data: LoginDto) => {
      return instance.post<LoginResponse>('/auth/sign-in', data);
    },
    signUp: async (data: SignUpDto) => {
      return instance.post<SignUpDto>('/auth/sign-up', data);
    },
    changePassword: async (data: ChangePasswordDto) => {
      return instance.post('/auth/change-password', data);
    },
    refreshToken: async () => {
      return instance.post<LoginResponse>('/auth/refresh-token');
    },
  },
};

export { apmoApi, instance };

export type {
  DataType,
  Side,
  Entities,
  EntityItem,
  User,
  Plan,
  LoginDto,
  LoginResponse,
};
