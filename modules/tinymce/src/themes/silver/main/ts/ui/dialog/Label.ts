import { AddEventsBehaviour, AlloyComponent, AlloyEvents, Behaviour, GuiFactory, Keying, Memento, Replacing, SimpleSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Arr, Id, Optional } from '@ephox/katamari';
import { Attribute } from '@ephox/sugar';

import { UiFactoryBackstageShared } from '../../backstage/Backstage';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import * as RepresentingConfigs from '../alien/RepresentingConfigs';

type LabelSpec = Omit<Dialog.Label, 'type'>;

export const renderLabel = (spec: LabelSpec, backstageShared: UiFactoryBackstageShared, getCompByName: (name: string) => Optional<AlloyComponent>): SimpleSpec => {
  const baseClass = 'tox-label';
  const centerClass = spec.align === 'center' ? [ `${baseClass}--center` ] : [];
  const endClass = spec.align === 'end' ? [ `${baseClass}--end` ] : [];
  const label = Memento.record({
    dom: {
      tag: 'label',
      classes: [ baseClass, ...centerClass, ...endClass ]
    },
    components: [
      GuiFactory.text(backstageShared.providers.translate(spec.label))
    ]
  });

  const comps = Arr.map(spec.items, backstageShared.interpreter);
  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-form__group' ]
    },
    components: [
      label.asSpec(),
      ...comps
    ],
    behaviours: Behaviour.derive([
      ComposingConfigs.self(),
      Replacing.config({}),
      RepresentingConfigs.domHtml(Optional.none()),
      Keying.config({
        mode: 'acyclic'
      }),
      AddEventsBehaviour.config('label', [
        AlloyEvents.runOnAttached((comp) => {
          spec.for.each((name) => {
            getCompByName(name).each((target) => {
              label.getOpt(comp).each((labelComp) => {
                const id = Attribute.get(target.element, 'id') ?? Id.generate('form-field');
                Attribute.set(target.element, 'id', id);
                Attribute.set(labelComp.element, 'for', id);
              });
            });
          });
        })
      ]),
    ])
  };
};
