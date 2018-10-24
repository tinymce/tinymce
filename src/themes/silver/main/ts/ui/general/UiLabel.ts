import { Behaviour, Keying, Replacing, SimpleSpec } from '@ephox/alloy';
import { Option } from '@ephox/katamari';

import { ComposingConfigs } from '../alien/ComposingConfigs';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';

export interface RenderUiLabel<I> {
  label: string;
  items: I[];
}

export const renderUiLabel = (spec: RenderUiLabel<SimpleSpec>): SimpleSpec => {
  return {
    dom: {
      tag: 'label',
      innerHtml: spec.label,
      classes: [ 'tox-label' ]
    },
    components: spec.items,
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