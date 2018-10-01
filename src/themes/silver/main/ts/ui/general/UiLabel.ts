import { Behaviour, Replacing, SimpleSpec } from '@ephox/alloy';

import { ComposingConfigs } from '../alien/ComposingConfigs';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import { Option } from '@ephox/katamari';

export interface UiLabelFoo {
  name: string;
  html: string;
}

export const renderUiLabel = function (spec: UiLabelFoo): SimpleSpec {
  return {
    dom: {
      tag: 'label',
      innerHtml: spec.html
    },
    behaviours: Behaviour.derive([
      ComposingConfigs.self(),
      Replacing.config({ }),
      RepresentingConfigs.domHtml(Option.some(spec.html))
    ])
  };
};