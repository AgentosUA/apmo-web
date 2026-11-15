import { z } from 'zod';

import { fields } from '@/shared/lib/validation';
import { changePasswordRequestSchema, setPasswordRequestSchema } from '@/shared/sdk';

const passwordsMatch = {
  path: ['confirmPassword'],
  error: 'common:passwordsMustMatch',
};

/** Change-password request + new password confirmation (client-only field). */
const changePasswordFormSchema = changePasswordRequestSchema
  .extend({ confirmPassword: fields.password() })
  .refine((values) => values.newPassword === values.confirmPassword, passwordsMatch);

/** First password of a user who signed up with Google / Steam / VTG. */
const setPasswordFormSchema = setPasswordRequestSchema
  .extend({ confirmPassword: fields.password() })
  .refine((values) => values.newPassword === values.confirmPassword, passwordsMatch);

type ChangePasswordFormValues = z.input<typeof changePasswordFormSchema>;
type SetPasswordFormValues = z.input<typeof setPasswordFormSchema>;

export { changePasswordFormSchema, setPasswordFormSchema };
export type { ChangePasswordFormValues, SetPasswordFormValues };
