import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm,
  type FieldValues,
  type Path,
  type Resolver,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import type { z } from 'zod';

import { getApiErrorMessage } from '@/shared/sdk/errors';

type ZodFormSchema = z.ZodType<FieldValues, FieldValues>;

/**
 * `useForm` wired to a zod schema. Validates a field once it was touched,
 * then re-validates on every change.
 */
const useZodForm = <TSchema extends ZodFormSchema>(
  schema: TSchema,
  props?: Omit<UseFormProps<z.input<TSchema>, unknown, z.output<TSchema>>, 'resolver'>
) =>
  useForm<z.input<TSchema>, unknown, z.output<TSchema>>({
    mode: 'onTouched',
    ...props,
    // The resolver cannot infer input/output from a generic schema; the cast is safe.
    resolver: zodResolver(schema) as unknown as Resolver<
      z.input<TSchema>,
      unknown,
      z.output<TSchema>
    >,
  });

/**
 * Puts an API error on the form: on `field` when given, otherwise as a
 * form-level error readable at `formState.errors.root?.server?.message`.
 */
const setServerError = <TValues extends FieldValues>(
  form: Pick<UseFormReturn<TValues, unknown, any>, 'setError'>,
  error: unknown,
  field?: Path<TValues>
) => {
  const message = getApiErrorMessage(error);

  if (field) {
    form.setError(field, { type: 'server', message }, { shouldFocus: true });

    return;
  }

  form.setError('root.server', { type: 'server', message });
};

export { useZodForm, setServerError };
