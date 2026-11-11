import { io, type Socket } from 'socket.io-client';

import type { PlanPermissions } from '../plans/plan.schema';
import { tokenStorage } from '../token';

/* ------------------------------- types ------------------------------ */

/** Sweet Markers marker as the app keeps it. */
type RealtimeMarker = {
  id: string | number;
  data: unknown[];
};

type MarkerOp =
  | { type: 'add'; marker: RealtimeMarker }
  | { type: 'update'; marker: RealtimeMarker }
  | { type: 'remove'; id: string | number }
  | { type: 'set'; markers: RealtimeMarker[] };

type PlanPatch = {
  title?: string;
  slots?: Record<string, string>;
};

/** Someone who has the plan open (one entry per tab). */
type Presence = {
  sessionId: string;
  userId: string | null;
  username: string;
  avatar: string | null;
  isGuest: boolean;
};

type Ack<T = object> = ({ ok: true } & T) | { ok: false; error: string };

type JoinResult = Ack<{
  sessionId: string;
  permissions: PlanPermissions;
  markers: RealtimeMarker[];
  presence: Presence[];
}>;

type ServerEvents = {
  presence: (presence: Presence[]) => void;
  'markers:op': (payload: { op: MarkerOp; by: string | null }) => void;
  'plan:patched': (payload: { patch: PlanPatch; by: string }) => void;
  'plan:permissions': (permissions: PlanPermissions) => void;
  'plan:access-revoked': () => void;
  'plan:deleted': () => void;
};

type ClientEvents = {
  'plan:join': (body: { planId: string }, ack: (result: JoinResult) => void) => void;
  'plan:leave': (ack?: (result: Ack) => void) => void;
  'markers:op': (body: { op: MarkerOp }, ack: (result: Ack) => void) => void;
  'plan:patch': (body: { patch: PlanPatch }, ack: (result: Ack) => void) => void;
};

type PlanSocket = Socket<ServerEvents, ClientEvents>;

/* ----------------------------- connection --------------------------- */

/**
 * `NEXT_PUBLIC_API_URL` = `https://host/api` → socket at `https://host`,
 * path `/api/socket.io`, namespace `/plans` (see `PlanGateway` in the API).
 */
const getSocketTarget = () => {
  const apiUrl = new URL(
    process.env.NEXT_PUBLIC_API_URL || '/api',
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
  );
  const basePath = apiUrl.pathname.replace(/\/+$/, '');

  return {
    url: `${apiUrl.origin}/plans`,
    path: `${basePath}/socket.io`,
  };
};

/** Not connected yet — call `.connect()`. Auth is re-read on every (re)connect. */
const createPlanSocket = ({ guestName }: { guestName: string }): PlanSocket => {
  const { url, path } = getSocketTarget();

  return io(url, {
    path,
    autoConnect: false,
    transports: ['websocket', 'polling'],
    auth: (callback) => callback({ token: tokenStorage.getToken() ?? '', guestName }),
  });
};

export { createPlanSocket };

export type { RealtimeMarker, MarkerOp, PlanPatch, Presence, JoinResult, PlanSocket, Ack };
