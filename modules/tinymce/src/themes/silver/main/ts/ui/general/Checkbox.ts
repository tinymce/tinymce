/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour,
  AlloyComponent,
  AlloyEvents,
  AlloyTriggers,
  Behaviour,
  Disabling,
  Focusing,
  FormField as AlloyFormField,
  Keying,
  Memento,
  NativeEvents,
  Representing,
  SimpleSpec,
  Tabstopping,
  Unselecting
} from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { HTMLInputElement } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';

import { ComposingConfigs } from '../alien/ComposingConfigs';
import * as Icons from '../icons/Icons';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { formChangeEvent } from './FormEvents';
import { Omit } from '../Omit';

type CheckboxSpec = Omit<Types.Checkbox.Checkbox, 'type'>;

export const renderCheckbox = (spec: CheckboxSpec, providerBackstage: UiFactoryBackstageProviders): SimpleSpec => {
  const repBehaviour = Representing.config({
    store: {
      mode: 'manual',
      getValue: (comp: AlloyComponent): boolean => {
        const el = comp.element().dom() as HTMLInputElement;
        return el.checked;
      },
      setValue: (comp: AlloyComponent, value: boolean) => {
        const el = comp.element().dom() as HTMLInputElement;
        el.checked = value;
      }
    }
  });

  const toggleCheckboxHandler = (comp) => {
    comp.element().dom().click();
    return Option.some(true);
  };

  const pField = AlloyFormField.parts().field({
    factory: { sketch: Fun.identity },
    dom: {
      tag: 'input',
      classes: ['tox-checkbox__input'],
      attributes: {
        type: 'checkbox'
      }
    },

    behaviours: Behaviour.derive([
      ComposingConfigs.self(),
      Disabling.config({ disabled: spec.disabled }),
      Tabstopping.config({}),
      Focusing.config({ }),
      repBehaviour,
      Keying.config({
        mode: 'special',
        onEnter: toggleCheckboxHandler,
        onSpace: toggleCheckboxHandler,
        stopSpaceKeyup: true
      }),
      AddEventsBehaviour.config('checkbox-events', [
        AlloyEvents.run(NativeEvents.change(), (component, _) => {
          AlloyTriggers.emitWith(component, formChangeEvent, { name: spec.name } );
        })
      ])
    ]),
  });

  const pLabel = AlloyFormField.parts().label({
    dom: {
      tag: 'span',
      classes: ['tox-checkbox__label'],
      innerHtml: providerBackstage.translate(spec.label)
    },
    behaviours: Behaviour.derive([
      Unselecting.config({})
    ])
  });

  const makeIcon = (className: string) => {
    const iconName = className === 'checked' ? 'selected' : 'unselected';
    return {
      dom: {
        tag: 'span',
        classes: ['tox-icon', 'tox-checkbox-icon__' + className],
        innerHtml: Icons.get(iconName, providerBackstage.icons)
      }
    };
  };

  const memIcons = Memento.record(
    {
      dom: {
        tag: 'div',
        classes: ['tox-checkbox__icons']
      },
      components: [
        makeIcon('checked'),
        makeIcon('unchecked')
      ]
    }
  );

  return AlloyFormField.sketch({
    dom: {
      tag: 'label',
      classes: ['tox-checkbox'],
    },
    components: [
      pField,
      memIcons.asSpec(),
      pLabel
    ],
    fieldBehaviours: Behaviour.derive([
      Disabling.config({
        disabled: spec.disabled,
        disableClass: 'tox-checkbox--disabled',
        onDisabled: (comp) => {
          AlloyFormField.getField(comp).each(Disabling.disable);
        },
        onEnabled: (comp) => {
          AlloyFormField.getField(comp).each(Disabling.enable);
        }
      })
    ])
  });
};
