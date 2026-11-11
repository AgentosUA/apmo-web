'use client';

import { useTranslation } from 'react-i18next';
import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

import { cn } from '@/shared/utils/cn';

/** Form-level message (server errors, success notes). `message` may be an i18n key. */
const FormAlert = ({
  message,
  variant = 'error',
  className,
}: {
  message?: string;
  variant?: 'error' | 'success';
  className?: string;
}) => {
  const { t } = useTranslation();

  if (!message) return null;

  const Icon = variant === 'error' ? FiAlertTriangle : FiCheckCircle;

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2.5 px-3 py-2.5 text-sm leading-snug text-white border border-solid border-l-[3px]',
        variant === 'error'
          ? 'bg-a3-red/15 border-a3-red/40 border-l-a3-red'
          : 'bg-[#008000]/15 border-[#008000]/40 border-l-[#00a000]',
        className
      )}
    >
      <Icon
        className={cn('mt-0.5 shrink-0', variant === 'error' ? 'text-[#ff6b6b]' : 'text-[#3ccf3c]')}
        aria-hidden
      />
      <span>{t(message)}</span>
    </div>
  );
};

export { FormAlert };
