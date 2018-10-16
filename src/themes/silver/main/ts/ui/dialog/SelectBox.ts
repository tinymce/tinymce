import {
  AddEventsBehaviour,
  AlloyEvents,
  AlloySpec,
  AlloyTriggers,
  Behaviour,
  FormField as AlloyFormField,
  HtmlSelect as AlloyHtmlSelect,
  NativeEvents,
  SimpleSpec,
  SketchSpec,
  Tabstopping,
} from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { Arr, Option } from '@ephox/katamari';
import { UiFactoryBackstageShared } from 'tinymce/themes/silver/backstage/Backstage';
import { renderLabel } from 'tinymce/themes/silver/ui/alien/FieldLabeller';
import * as Icons from 'tinymce/themes/silver/ui/icons/Icons';

import { formChangeEvent } from '../general/FormEvents';

export const renderSelectBox = (spec: Types.SelectBox.SelectBox, sharedBackstage: UiFactoryBackstageShared): SketchSpec => {
  // DUPE with TextField.
  const pLabel = spec.label.map((label) => renderLabel(label, sharedBackstage));

  const pField = AlloyFormField.parts().field({
    // TODO: Alloy should not allow dom changing of an HTML select!
    dom: {  },
    selectAttributes: {
      size: spec.size
    },
    options: spec.items,
    factory: AlloyHtmlSelect,
    selectBehaviours: Behaviour.derive([
      Tabstopping.config({ }),
      AddEventsBehaviour.config('selectbox-change', [
        AlloyEvents.run(NativeEvents.change(), (component, _) => {
          AlloyTriggers.emitWith(component, formChangeEvent, { name: spec.name } );
        })
      ])
    ])
  });

  const chevron = spec.size > 1 ? Option.none() :
    Option.some({
        dom: {
          tag: 'div',
          classes: ['tox-selectfield__icon-js'],
          innerHtml: Icons.get('icon-chevron-down', sharedBackstage.providers.icons)
        }
      });

  const selectWrap: SimpleSpec = {
    dom: {
      tag: 'div',
      classes: ['tox-selectfield']
    },
    components: Arr.flatten([[pField], chevron.toArray()])
  };

  return AlloyFormField.sketch({
    dom: {
      tag: 'div',
      classes: ['tox-form__group']
    },
    components: Arr.flatten<AlloySpec>([pLabel.toArray(), [selectWrap]])
  });
};