import { Behaviour, Keying, Replacing, SimpleSpec } from '@ephox/alloy';
import { Option } from '@ephox/katamari';

import { UiFactoryBackstageShared } from '../../backstage/Backstage';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';

export interface UiLabelFoo<I> {
  label: string;
}

export interface UiGroupLabelFoo<I> {
  label: string;
  items: I[];
}

export const renderUiLabel = (spec: UiLabelFoo<SimpleSpec>, sharedBackstage: UiFactoryBackstageShared): SimpleSpec => {
  return {
    dom: {
      tag: 'label',
      innerHtml: spec.label,
      classes: [ 'tox-label' ]
    },
    behaviours: Behaviour.derive([
      ComposingConfigs.self(),
      Replacing.config({ }),
      RepresentingConfigs.domHtml(Option.some(spec.label)),
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
      innerHtml: spec.label,
      classes: [ 'tox-label', 'tox-label-group' ]
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