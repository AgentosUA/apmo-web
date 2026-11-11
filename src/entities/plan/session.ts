import { makeAutoObservable, runInAction, toJS } from 'mobx';

import { getGuestName } from '@/shared/config/random-names';
import {
  createPlanSocket,
  type MarkerOp,
  type PlanPatch,
  type PlanSocket,
  type Presence,
} from '@/shared/sdk/realtime';
import { toasterEntity } from '@/shared/ui/organisms/toaster/model';

import { markersEntity } from '../markers';
import { missionEntity } from '../mission';

import { planEntity } from './model';

type SessionStatus = 'idle' | 'connecting' | 'online' | 'offline';

const ACK_TIMEOUT = 10_000;

/**
 * Real-time connection to an open saved plan:
 * - every marker change of this user is sent as an op and saved by the API
 *   (no "Save" button any more);
 * - changes of other people are applied as they come;
 * - `presence` — who has the plan open.
 *
 * Changes made while offline are queued and re-applied on top of the server
 * state after reconnecting.
 */
class PlanSession {
  status: SessionStatus = 'idle';
  presence: Presence[] = [];
  /** This tab in `presence`. */
  sessionId: string | null = null;
  /** Sent changes not confirmed by the server yet. */
  inFlight = 0;

  private socket: PlanSocket | null = null;
  private planId: string | null = null;
  private joined = false;
  private queue: MarkerOp[] = [];
  private pendingPatch: PlanPatch | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    makeAutoObservable<
      PlanSession,
      'socket' | 'planId' | 'joined' | 'queue' | 'pendingPatch' | 'unsubscribe'
    >(this, {
      socket: false,
      planId: false,
      joined: false,
      queue: false,
      pendingPatch: false,
      unsubscribe: false,
    });
  }

  /** One avatar per person (several tabs of one user count once), this user first. */
  get people(): (Presence & { isSelf: boolean })[] {
    const self = this.presence.find((item) => item.sessionId === this.sessionId);
    const seen = new Set<string>();
    const result: (Presence & { isSelf: boolean })[] = [];

    const keyOf = (item: Presence) => item.userId ?? item.sessionId;

    if (self) {
      seen.add(keyOf(self));
      result.push({ ...self, isSelf: true });
    }

    this.presence.forEach((item) => {
      const key = keyOf(item);

      if (seen.has(key)) return;

      seen.add(key);
      result.push({ ...item, isSelf: false });
    });

    return result;
  }

  get hasUnsavedChanges() {
    return this.inFlight > 0 || this.status === 'offline';
  }

  connect = (planId: string) => {
    this.disconnect();

    this.planId = planId;
    this.status = 'connecting';

    const socket = createPlanSocket({ guestName: getGuestName() });

    this.socket = socket;

    socket.on('connect', this.join);

    socket.on('disconnect', () => {
      runInAction(() => {
        this.joined = false;
        this.inFlight = 0;
        this.status = 'offline';
      });
    });

    socket.on('connect_error', () => {
      runInAction(() => {
        this.status = 'offline';
      });
    });

    socket.on('presence', (presence) => {
      runInAction(() => {
        this.presence = presence;
      });
    });

    socket.on('markers:op', ({ op }) => markersEntity.applyRemoteOp(op));

    socket.on('plan:patched', ({ patch }) => this.applyPatch(patch));

    socket.on('plan:permissions', (permissions) => planEntity.setPermissions(permissions));

    socket.on('plan:access-revoked', () => {
      planEntity.setLoadError('forbidden');
      this.disconnect();
    });

    socket.on('plan:deleted', () => {
      toasterEntity.call({
        title: 'widgets:planToolbar:deletedTitle',
        description: 'widgets:planToolbar:deletedDescription',
      });
      planEntity.setLoadError('not_found');
      this.disconnect();
    });

    this.unsubscribe = markersEntity.subscribe(this.sendOp);

    socket.connect();
  };

  disconnect = () => {
    this.unsubscribe?.();
    this.unsubscribe = null;

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    this.socket = null;
    this.planId = null;
    this.joined = false;
    this.queue = [];
    this.pendingPatch = null;
    this.status = 'idle';
    this.presence = [];
    this.sessionId = null;
    this.inFlight = 0;
  };

  /** Mission slots / title changes (title — owner only). */
  patch = (patch: PlanPatch) => {
    if (!this.socket) return;

    if (!this.joined) {
      this.pendingPatch = { ...this.pendingPatch, ...patch };

      return;
    }

    this.emitWithAck('plan:patch', { patch });
  };

  private join = () => {
    const socket = this.socket;
    const planId = this.planId;

    if (!socket || !planId) return;

    socket.timeout(ACK_TIMEOUT).emit('plan:join', { planId }, (error, result) => {
      if (socket !== this.socket) return;

      if (error || !result) {
        runInAction(() => {
          this.status = 'offline';
        });

        // Retry while the connection is alive.
        if (socket.connected) setTimeout(this.join, 3000);

        return;
      }

      if (!result.ok) {
        planEntity.setLoadError(result.error === 'forbidden' ? 'forbidden' : 'not_found');
        this.disconnect();

        return;
      }

      runInAction(() => {
        this.sessionId = result.sessionId;
        this.presence = result.presence;
        this.joined = true;
        this.status = 'online';
      });

      planEntity.setPermissions(result.permissions);

      // The server state wins, then changes made offline go on top of it.
      markersEntity.setSWTMarkers(result.markers as never);

      const queue = this.queue;
      this.queue = [];

      if (result.permissions.canEdit) {
        queue.forEach((op) => {
          markersEntity.applyRemoteOp(op);
          this.sendOp(op);
        });

        if (this.pendingPatch) {
          this.patch(this.pendingPatch);
          this.pendingPatch = null;
        }
      }
    });
  };

  private sendOp = (op: MarkerOp) => {
    if (!this.socket) return;

    if (!this.joined) {
      this.queue.push(toJS(op));

      return;
    }

    this.emitWithAck('markers:op', { op });
  };

  private emitWithAck(event: 'markers:op', body: { op: MarkerOp }): void;
  private emitWithAck(event: 'plan:patch', body: { patch: PlanPatch }): void;
  private emitWithAck(event: 'markers:op' | 'plan:patch', body: unknown) {
    const socket = this.socket;

    if (!socket) return;

    this.inFlight += 1;

    const onAck = (error: Error | null, result?: { ok: boolean; error?: string }) => {
      if (socket !== this.socket) return;

      runInAction(() => {
        this.inFlight = Math.max(0, this.inFlight - 1);
      });

      if (error || !result) {
        // Lost on the way: get the server state again.
        if (socket.connected) this.join();

        return;
      }

      if (!result.ok && result.error === 'forbidden') {
        toasterEntity.call({
          title: 'widgets:planToolbar:readOnlyTitle',
          description: 'widgets:planToolbar:readOnlyDescription',
        });
        this.join();
      }
    };

    (
      socket.timeout(ACK_TIMEOUT) as unknown as {
        emit: (event: string, body: unknown, ack: typeof onAck) => void;
      }
    ).emit(event, body, onAck);
  }

  private applyPatch(patch: PlanPatch) {
    runInAction(() => {
      if (patch.title !== undefined) {
        planEntity.setTitle(patch.title);
      }

      if (patch.slots && missionEntity.data) {
        missionEntity.data.slots = patch.slots;
      }
    });
  }
}

const planSession = new PlanSession();

export { PlanSession, planSession };

export type { SessionStatus };
