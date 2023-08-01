import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyTriggers, Behaviour, Disabling, Focusing, FormField as AlloyFormField, GuiFactory, Keying, Memento,
  NativeEvents, SimpleSpec, Tabstopping, Unselecting
} from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Fun, Optional } from '@ephox/katamari';
import { Checked, Class, Traverse } from '@ephox/sugar';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as ReadOnly from '../../ReadOnly';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import * as RepresentingConfigs from '../alien/RepresentingConfigs';
import * as Icons from '../icons/Icons';
import { formChangeEvent } from './FormEvents';

type CheckboxSpec = Omit<Dialog.Checkbox, 'type'>;

export const renderCheckbox = (spec: CheckboxSpec, providerBackstage: UiFactoryBackstageProviders, initialData: Optional<boolean>): SimpleSpec => {
  const toggleCheckboxHandler = (comp: AlloyComponent) => {
    comp.element.dom.click();
    return Optional.some(true);
  };

  const pField = AlloyFormField.parts.field({
    factory: { sketch: Fun.identity },
    dom: {
      tag: 'input',
      classes: [ 'tox-checkbox__input' ],
      attributes: {
        type: 'checkbox'
      }
    },

    behaviours: Behaviour.derive([
      ComposingConfigs.self(),
      Disabling.config({
        disabled: () => !spec.enabled || providerBackstage.isDisabled(),
        onDisabled: (component) => {
          Traverse.parentElement(component.element).each((element) => Class.add(element, 'tox-checkbox--disabled'));
        },
        onEnabled: (component) => {
          Traverse.parentElement(component.element).each((element) => Class.remove(element, 'tox-checkbox--disabled'));
        }
      }),
      Tabstopping.config({}),
      Focusing.config({ }),
      RepresentingConfigs.withElement(initialData, Checked.get, Checked.set),
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
    ])
  });

  const pLabel = AlloyFormField.parts.label({
    dom: {
      tag: 'span',
      classes: [ 'tox-checkbox__label' ]
    },
    components: [
      GuiFactory.text(providerBackstage.translate(spec.label))
    ],
    behaviours: Behaviour.derive([
      Unselecting.config({})
    ])
  });

  const makeIcon = (className: string) => {
    const iconName = className === 'checked' ? 'selected' : 'unselected';
    return Icons.render(iconName, { tag: 'span', classes: [ 'tox-icon', 'tox-checkbox-icon__' + className ] }, providerBackstage.icons);
  };

  const memIcons = Memento.record(
    {
      dom: {
        tag: 'div',
        classes: [ 'tox-checkbox__icons' ]
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
      classes: [ 'tox-checkbox' ]
    },
    components: [
      pField,
      memIcons.asSpec(),
      pLabel
    ],
    fieldBehaviours: Behaviour.derive([
      Disabling.config({
        disabled: () => !spec.enabled || providerBackstage.isDisabled(),
      }),
      ReadOnly.receivingConfig()
    ])
  });
};
