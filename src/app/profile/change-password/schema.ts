import { z } from 'zod';

import { fields } from '@/shared/lib/validation';
import { changePasswordRequestSchema } from '@/shared/sdk';

/** Change-password request + new password confirmation (client-only field). */
const changePasswordFormSchema = changePasswordRequestSchema
  .extend({ confirmPassword: fields.password() })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    error: 'common:passwordsMustMatch',
  });

type ChangePasswordFormValues = z.input<typeof changePasswordFormSchema>;

export { changePasswordFormSchema };
export type { ChangePasswordFormValues };
