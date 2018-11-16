import { SimpleSpec } from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { Arr } from '@ephox/katamari';
import { UiFactoryBackstageShared } from '../../backstage/Backstage';

export const renderBar = <I>(spec: Types.Grid.Grid, backstage: UiFactoryBackstageShared): SimpleSpec => {
  return {
    dom: {
      tag: 'div',
      classes: ['tox-bar']
    },
    components: Arr.map(spec.items, backstage.interpreter)
  };
};