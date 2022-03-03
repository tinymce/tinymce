import {
  AddEventsBehaviour, AlloyEvents, AlloySpec, AlloyTriggers, Behaviour, Disabling, FormField as AlloyFormField, HtmlSelect as AlloyHtmlSelect,
  NativeEvents, SimpleSpec, SketchSpec, Tabstopping
} from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Arr, Optional } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from 'tinymce/themes/silver/backstage/Backstage';
import { renderLabel } from 'tinymce/themes/silver/ui/alien/FieldLabeller';
import * as Icons from 'tinymce/themes/silver/ui/icons/Icons';

import * as ReadOnly from '../../ReadOnly';
import { formChangeEvent } from '../general/FormEvents';

type SelectBoxSpec = Omit<Dialog.SelectBox, 'type'>;

export const renderSelectBox = (spec: SelectBoxSpec, providersBackstage: UiFactoryBackstageProviders, initialData: Optional<string>): SketchSpec => {
  const translatedOptions = Arr.map(spec.items, (item) => ({
    text: providersBackstage.translate(item.text),
    value: item.value
  }));

  // DUPE with TextField.
  const pLabel = spec.label.map((label) => renderLabel(label, providersBackstage));

  const pField = AlloyFormField.parts.field({
    // TODO: Alloy should not allow dom changing of an HTML select!
    dom: { },
    ...initialData.map((data) => ({ data })).getOr({}),
    selectAttributes: {
      size: spec.size
    },
    options: translatedOptions,
    factory: AlloyHtmlSelect,
    selectBehaviours: Behaviour.derive([
      Disabling.config({
        disabled: () => !spec.enabled || providersBackstage.isDisabled()
      }),
      Tabstopping.config({ }),
      AddEventsBehaviour.config('selectbox-change', [
        AlloyEvents.run(NativeEvents.change(), (component, _) => {
          AlloyTriggers.emitWith(component, formChangeEvent, { name: spec.name } );
        })
      ])
    ])
  });

  const chevron: Optional<AlloySpec> = spec.size > 1 ? Optional.none() :
    Optional.some(Icons.render('chevron-down', { tag: 'div', classes: [ 'tox-selectfield__icon-js' ] }, providersBackstage.icons));

  const selectWrap: SimpleSpec = {
    dom: {
      tag: 'div',
      classes: [ 'tox-selectfield' ]
    },
    components: Arr.flatten([[ pField ], chevron.toArray() ])
  };

  return AlloyFormField.sketch({
    dom: {
      tag: 'div',
      classes: [ 'tox-form__group' ]
    },
    components: Arr.flatten<AlloySpec>([ pLabel.toArray(), [ selectWrap ]]),
    fieldBehaviours: Behaviour.derive([
      Disabling.config({
        disabled: () => !spec.enabled || providersBackstage.isDisabled(),
        onDisabled: (comp) => {
          AlloyFormField.getField(comp).each(Disabling.disable);
        },
        onEnabled: (comp) => {
          AlloyFormField.getField(comp).each(Disabling.enable);
        }
      }),
      ReadOnly.receivingConfig()
    ])
  });
};
