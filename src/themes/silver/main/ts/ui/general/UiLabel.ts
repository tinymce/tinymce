import { Behaviour, Keying, Replacing, SimpleSpec } from '@ephox/alloy';
import { Option, Arr } from '@ephox/katamari';

import { ComposingConfigs } from '../alien/ComposingConfigs';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import { Types } from '@ephox/bridge';
import { UiFactoryBackstageShared } from '../../backstage/Backstage';

export const renderUiLabel = (spec: Types.Label.Label, backstageShared: UiFactoryBackstageShared): SimpleSpec => {
  return {
    dom: {
      tag: 'label',
      innerHtml: backstageShared.providers.translate(spec.label),
      classes: [ 'tox-label' ]
    },
    components: Arr.map(spec.items, backstageShared.interpreter),
    behaviours: Behaviour.derive([
      ComposingConfigs.self(),
      Replacing.config({ }),
      RepresentingConfigs.domHtml(Option.none()),
      Keying.config({
        mode: 'acyclic'
      }),
    ])
  };
};