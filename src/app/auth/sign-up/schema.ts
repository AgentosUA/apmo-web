import { z } from 'zod';

import { fields } from '@/shared/lib/validation';
import { signUpRequestSchema } from '@/shared/sdk';

/** Sign-up request + password confirmation (client-only field). */
const signUpFormSchema = signUpRequestSchema
  .extend({ rePassword: fields.password() })
  .refine((values) => values.password === values.rePassword, {
    path: ['rePassword'],
    error: 'common:passwordsMustMatch',
  });

type SignUpFormValues = z.input<typeof signUpFormSchema>;

export { signUpFormSchema };
export type { SignUpFormValues };
