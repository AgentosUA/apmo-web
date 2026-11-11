'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiUsers } from 'react-icons/fi';

import { api, type PublicUser, type SquadSummary } from '@/shared/sdk';
import { Avatar } from '@/shared/ui/atoms/avatar';
import { cn } from '@/shared/utils/cn';

type Principal = { kind: 'user'; user: PublicUser } | { kind: 'squad'; squad: SquadSummary };

const DEBOUNCE = 250;
const MIN_QUERY = 2;

const keyOf = (item: Principal) =>
  `${item.kind}:${item.kind === 'user' ? item.user.id : item.squad.id}`;

/** Squad logo or a placeholder icon. */
const SquadLogo = ({
  squad,
  size = 24,
}: {
  squad: Pick<SquadSummary, 'logo' | 'name'>;
  size?: number;
}) =>
  squad.logo ? (
    <Avatar name={squad.name} src={squad.logo} size={size} className="rounded-xs" />
  ) : (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-xs bg-white/10 text-white/70"
      style={{ width: size, height: size }}
    >
      <FiUsers />
    </span>
  );

/**
 * Search field with a dropdown of users (by nickname) and/or squads
 * (by name or tag). Already chosen entries are hidden.
 */
const PrincipalSearch = ({
  kinds = ['user', 'squad'],
  excludeKeys = [],
  onSelect,
  placeholder,
  disabled,
  className,
}: {
  kinds?: ('user' | 'squad')[];
  /** `user:<id>` / `squad:<id>` to hide. */
  excludeKeys?: string[];
  onSelect: (item: Principal) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) => {
  const { t } = useTranslation();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Principal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const withUsers = kinds.includes('user');
  const withSquads = kinds.includes('squad');

  useEffect(() => {
    const value = query.trim();

    if (value.length < MIN_QUERY) {
      setResults([]);
      setIsLoading(false);

      return;
    }

    const controller = new AbortController();

    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const [users, squads] = await Promise.all([
          withUsers ? api.users.search(value, controller.signal) : Promise.resolve([]),
          withSquads ? api.squads.search(value, controller.signal) : Promise.resolve([]),
        ]);

        setResults([
          ...users.map((user): Principal => ({ kind: 'user', user })),
          ...squads.map((squad): Principal => ({ kind: 'squad', squad })),
        ]);
        setActiveIndex(0);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, DEBOUNCE);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, withUsers, withSquads]);

  const visible = results.filter((item) => !excludeKeys.includes(keyOf(item)));

  const select = (item: Principal) => {
    onSelect(item);
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!visible.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % visible.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + visible.length) % visible.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      select(visible[Math.min(activeIndex, visible.length - 1)]);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const showList = isOpen && query.trim().length >= MIN_QUERY;

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <FiSearch className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          value={query}
          disabled={disabled}
          placeholder={placeholder ?? t('features:principalSearch:placeholder')}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          onKeyDown={onKeyDown}
          className={cn(
            'h-9 w-full border border-white/15 bg-black/60 pl-8 pr-3 text-sm text-white placeholder:text-white/30',
            'hover:border-white/30 focus:border-a3-orange focus:bg-black/80 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        />
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto border border-white/15 bg-[#0b0b0b] shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
        >
          {isLoading && !visible.length && (
            <li className="px-3 py-2 text-xs text-white/50">{t('common:loading')}…</li>
          )}
          {!isLoading && !visible.length && (
            <li className="px-3 py-2 text-xs text-white/50">
              {t('features:principalSearch:nothingFound')}
            </li>
          )}
          {visible.map((item, index) => (
            <li
              key={keyOf(item)}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => select(item)}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                'flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-white',
                index === activeIndex && 'bg-white/10'
              )}
            >
              {item.kind === 'user' ? (
                <>
                  <Avatar name={item.user.username} src={item.user.avatar} size={24} />
                  <span className="truncate">{item.user.username}</span>
                </>
              ) : (
                <>
                  <SquadLogo squad={item.squad} />
                  <span className="truncate">
                    <span className="text-a3-orange">[{item.squad.tag}]</span> {item.squad.name}
                  </span>
                  {item.squad.membersCount !== undefined && (
                    <span className="ml-auto shrink-0 text-xs text-white/40">
                      {t('features:principalSearch:members', { count: item.squad.membersCount })}
                    </span>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export { PrincipalSearch, SquadLogo };

export type { Principal };
