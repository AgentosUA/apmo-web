import { ChangeLanguage } from '@/features/settings/change-language/ui';
import { Localize } from '@/shared/ui/quarks/localize/ui';

const Footer = () => {
  return (
    <footer className="mt-auto flex justify-between items-center bg-black/70 text-center gap-3 min-h-28 px-12">
      <div />

      <div className="flex flex-col items-center gap-2 text-white w-fit">
        <div>
          <Localize translationKey="widgets:footer:createdBy" />{' '}
          <span className="text-a3-orange">Agentos</span> &{' '}
          <span className="text-a3-orange">XDred</span>
        </div>
        <div>
          <Localize translationKey="widgets:footer:feelFreeToContribute" />{' '}
          <a
            className="hover:underline !text-a3-orange"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/AgentosUA/apmo-web"
          >
            GitHub
          </a>
        </div>
      </div>

      <ChangeLanguage className="shrink-0" />
    </footer>
  );
};

export { Footer };
