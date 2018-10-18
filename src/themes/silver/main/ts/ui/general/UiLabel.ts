import { Behaviour, Keying, Replacing, SimpleSpec } from '@ephox/alloy';
import { Arr, Option } from '@ephox/katamari';

import { UiFactoryBackstageShared } from '../../backstage/Backstage';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';

export interface UiLabelFoo<I> {
  name: string;
  html: string;
}

export interface UiGroupLabelFoo<I> {
  name: string;
  html: string;
  items: I[];
}

export const renderUiLabel = (spec: UiLabelFoo<SimpleSpec>, sharedBackstage: UiFactoryBackstageShared): SimpleSpec => {
  return {
    dom: {
      tag: 'label',
      innerHtml: spec.html,
      classes: [ 'tox-label' ]
    },
    behaviours: Behaviour.derive([
      ComposingConfigs.self(),
      Replacing.config({ }),
      RepresentingConfigs.domHtml(Option.some(spec.html)),
      Keying.config({
        mode: 'acyclic'
      }),
    ])
  };
};

export const renderUiGroupLabel = (spec: UiGroupLabelFoo<SimpleSpec>, sharedBackstage: UiFactoryBackstageShared): SimpleSpec => {
  return {
    dom: {
      tag: 'label',
      innerHtml: spec.html,
      classes: [ 'tox-label', 'tox-label-group' ]
    },
    components: Arr.map(spec.items, sharedBackstage.interpreter),
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