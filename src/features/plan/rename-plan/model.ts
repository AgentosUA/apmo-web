import { planEntity, planSession } from '@/entities/plan';

/**
 * Renames the open plan. A saved plan is renamed through the real-time
 * session (queued while offline, everyone in the plan sees it); a new plan
 * keeps the name locally and uses it in the "Save" dialog.
 */
const renameOpenPlan = (title: string) => {
  planEntity.setTitle(title);

  if (planEntity.isSaved) planSession.patch({ title });
};

export { renameOpenPlan };
