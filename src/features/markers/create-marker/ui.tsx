import { observer } from 'mobx-react-lite';
import styles from './ui.module.scss';
import { FC } from 'react';
import { CreateMarkerModel, createMarkerEntity } from '.';

const CreateMarker: FC<{
  model?: CreateMarkerModel;
}> = observer(({ model }) => {
  const entity = model ?? createMarkerEntity;

  if (!entity.isVisible) return null;

  return (
    <div className={styles.wrapper}>
      <h1>Create Marker</h1>
    </div>
  );
});

export { CreateMarker };
