import axios, { AxiosPromise, AxiosResponse } from 'axios';

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
  mission: any;
};

type GetPlanByIdDto = {
  id: string;
};

type PlanResponse = {
  title: string;
};

const instance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apmoApi = {
  plan: {
    createPlan: async (data: CreatePlanDto) => {
      return instance.post('/plans', {
        data,
      });
    },

    getPlanById: async (data: GetPlanByIdDto) => {
      return instance.get<PlanResponse>(`/plans/${data.id}`);
    },
  },
};

export { apmoApi };

export type { DataType, Side, Entities, EntityItem };
