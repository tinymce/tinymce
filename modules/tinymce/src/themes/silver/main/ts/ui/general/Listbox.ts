/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Behaviour, FormField as AlloyFormField, HtmlSelect, SketchSpec, Tabstopping } from '@ephox/alloy';
import { Option } from '@ephox/katamari';
import { renderFormField, renderLabel } from 'tinymce/themes/silver/ui/alien/FieldLabeller';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';

// I think this was from before bridge. I don't think it is used.
export const renderListbox = (spec: ListboxSpec, providersBackstage: UiFactoryBackstageProviders): SketchSpec => {
  const pLabel = renderLabel(spec.label, providersBackstage);

  const pField = AlloyFormField.parts().field({
    factory: HtmlSelect,
    dom: {
      classes: [ 'mce-select-field' ]
    },
    selectBehaviours: Behaviour.derive([
      Tabstopping.config({ })
    ]),
    options: spec.values,
    // FIX: Don't use undefined here.
    data: spec.initialValue.getOr(undefined)
  });

  return renderFormField(Option.some(pLabel), pField);
};

export interface ListboxSpec {
  name: string;
  label: string; // Probably make option like the rest.
  values: Array<{value: string, text: string}>;
  // Probably needs to come through form API
  initialValue: Option<string>;
}