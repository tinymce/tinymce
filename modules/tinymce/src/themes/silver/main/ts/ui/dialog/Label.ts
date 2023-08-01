import { AlloySpec, Behaviour, GuiFactory, Keying, Replacing, SimpleSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Arr, Optional } from '@ephox/katamari';

import { UiFactoryBackstageShared } from '../../backstage/Backstage';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import * as RepresentingConfigs from '../alien/RepresentingConfigs';

type LabelSpec = Omit<Dialog.Label, 'type'>;

export const renderLabel = (spec: LabelSpec, backstageShared: UiFactoryBackstageShared): SimpleSpec => {
  const baseClass = 'tox-label';
  const centerClass = spec.align === 'center' ? [ `${baseClass}--center` ] : [];
  const endClass = spec.align === 'end' ? [ `${baseClass}--end` ] : [];

  const label: AlloySpec = {
    dom: {
      tag: 'label',
      classes: [ baseClass, ...centerClass, ...endClass ]
    },
    components: [
      GuiFactory.text(backstageShared.providers.translate(spec.label))
    ]
  };

  const comps = Arr.map(spec.items, backstageShared.interpreter);
  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-form__group' ]
    },
    components: [
      label,
      ...comps
    ],
    behaviours: Behaviour.derive([
      ComposingConfigs.self(),
      Replacing.config({}),
      RepresentingConfigs.domHtml(Optional.none()),
      Keying.config({
        mode: 'acyclic'
      })
    ])
  };
};
