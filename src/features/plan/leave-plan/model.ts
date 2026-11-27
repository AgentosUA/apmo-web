import { markersEntity } from '@/entities/markers';
import { missionEntity } from '@/entities/mission';
import { planEntity, planSession } from '@/entities/plan';

/**
 * - `unsaved`: a new plan (not on the server) with markers or a mission;
 * - `unsynced`: a saved plan with changes the server has not received yet
 *   (offline or still sending).
 */
type LeavePlanWarning = 'unsaved' | 'unsynced';

/** What would be lost by leaving the plan now. Observable (reads MobX state). */
const getLeavePlanWarning = (): LeavePlanWarning | null => {
  if (planEntity.isSaved) return planSession.hasUnsavedChanges ? 'unsynced' : null;

  return markersEntity.swtMarkers.length > 0 || Boolean(missionEntity.data) ? 'unsaved' : null;
};

export { getLeavePlanWarning };

export type { LeavePlanWarning };
