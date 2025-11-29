import { Callsigns } from "@/entities/mission/types";

export type PaginationDto<T> = {
  skip?: number;
  take?: number;
} & T;

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  skip: number;
  take: number;
};

export type GetPlansDto = PaginationDto<{
  map?: string;
  missionName?: string;
}>;

export type PlanListItem = {
  id: string;
  planMarkers: string;
  
  mission: {
    missionName: string;
    island: string;
    slots: Callsigns;
  }
}