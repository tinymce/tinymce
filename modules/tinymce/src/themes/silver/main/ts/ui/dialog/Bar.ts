import { SimpleSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Arr } from '@ephox/katamari';

import { UiFactoryBackstageShared } from '../../backstage/Backstage';

type BarSpec = Omit<Dialog.Bar, 'type'>;

export const renderBar = (spec: BarSpec, backstage: UiFactoryBackstageShared): SimpleSpec => ({
  dom: {
    tag: 'div',
    classes: [ 'tox-bar', 'tox-form__controls-h-stack' ]
  },
  components: Arr.map(spec.items, backstage.interpreter)
});
