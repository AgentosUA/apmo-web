'use client';

import { cva } from 'class-variance-authority';
import { forwardRef, useId, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';

import { cn } from '@/shared/utils/cn';

const fieldVariants = cva(
  [
    'peer w-full bg-black/60 text-white border border-solid border-white/15',
    'placeholder:text-white/30 transition-[border-color,background-color,box-shadow] duration-150',
    'hover:border-white/30',
    'focus:outline-none focus:bg-black/80 focus:border-a3-orange focus:shadow-[inset_3px_0_0_var(--color-a3-orange)]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'autofill:shadow-[inset_0_0_0_1000px_rgba(0,0,0,0.9)] autofill:[-webkit-text-fill-color:white]',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 px-2 text-sm',
        md: 'h-10 px-3 text-sm',
      },
      invalid: {
        true: 'border-a3-red hover:border-a3-red focus:border-a3-red focus:shadow-[inset_3px_0_0_var(--color-a3-red)]',
        false: '',
      },
      withToggle: {
        true: 'pr-10',
        false: '',
      },
    },
    defaultVariants: { size: 'md', invalid: false, withToggle: false },
  }
);

type InputProps = Omit<ComponentPropsWithoutRef<'input'>, 'size'> & {
  label?: ReactNode;
  /** Error message or i18n key — translated before rendering. */
  error?: string;
  /** Helper text shown under the field when there is no error. */
  hint?: ReactNode;
  size?: 'sm' | 'md';
  /** Applied to the `<input>`; `className` goes to the wrapper. */
  inputClassName?: string;
};

/**
 * Text field with a static label above, an inline error below and
 * a show/hide toggle for passwords. Works uncontrolled (`{...register()}`)
 * and controlled (`value` + `onChange`).
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, inputClassName, label, error, hint, size, id, type = 'text', required, ...props },
    ref
  ) => {
    const { t } = useTranslation();
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const messageId = `${inputId}-message`;

    const isPassword = type === 'password';
    const [isRevealed, setIsRevealed] = useState(false);

    const hasError = Boolean(error);
    const message = hasError ? t(error as string) : hint;

    return (
      <div className={cn('group flex flex-col gap-1.5', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-xs uppercase tracking-[0.08em] text-white/60 transition-colors select-none',
              'group-focus-within:text-a3-orange',
              hasError && 'text-[#ff6b6b] group-focus-within:text-[#ff6b6b]'
            )}
          >
            {label}
            {required && <span className="ml-0.5 text-a3-orange">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={isPassword && isRevealed ? 'text' : type}
            required={required}
            aria-invalid={hasError || undefined}
            aria-describedby={message ? messageId : undefined}
            className={cn(
              fieldVariants({ size, invalid: hasError, withToggle: isPassword }),
              inputClassName
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setIsRevealed((value) => !value)}
              aria-label={isRevealed ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-white/40 hover:text-white transition-colors"
            >
              {isRevealed ? <FiEyeOff /> : <FiEye />}
            </button>
          )}
        </div>

        {message && (
          <p
            id={messageId}
            role={hasError ? 'alert' : undefined}
            className={cn(
              'flex items-start gap-1.5 text-xs leading-snug',
              hasError ? 'text-[#ff6b6b]' : 'text-white/45'
            )}
          >
            {hasError && <FiAlertCircle className="mt-px shrink-0" aria-hidden />}
            <span>{message}</span>
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, fieldVariants };
export type { InputProps };
