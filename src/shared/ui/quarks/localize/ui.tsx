import { FC, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

const Localize: FC<{
  translationKey: string;
}> = ({ translationKey }) => {
  const { t } = useTranslation();

  return <>{t(translationKey)}</>;
};

export { Localize };
