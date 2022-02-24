import { SimpleSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Arr } from '@ephox/katamari';

import { UiFactoryBackstageShared } from '../../backstage/Backstage';

type GridSpec = Omit<Dialog.Grid, 'type'>;

export const renderGrid = (spec: GridSpec, backstage: UiFactoryBackstageShared): SimpleSpec => ({
  dom: {
    tag: 'div',
    classes: [ 'tox-form__grid', `tox-form__grid--${spec.columns}col` ]
  },
  components: Arr.map(spec.items, backstage.interpreter)
});
