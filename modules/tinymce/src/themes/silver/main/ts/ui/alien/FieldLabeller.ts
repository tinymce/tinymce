/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { FormField as AlloyFormField, SketchSpec, RawDomSchema, AlloySpec, Behaviour } from '@ephox/alloy';
// TODO: Export properly from alloy.
import { Option } from '@ephox/katamari';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';

const renderFormFieldWith = (pLabel: Option<AlloySpec>, pField: AlloySpec, extraClasses: string[], extraBehaviours: Behaviour.NamedConfiguredBehaviour<any, any>[]): SketchSpec => {
  const spec = renderFormFieldSpecWith(pLabel, pField, extraClasses, extraBehaviours);
  return AlloyFormField.sketch(spec);
};

const renderFormField = (pLabel: Option<AlloySpec>, pField: AlloySpec): SketchSpec => renderFormFieldWith(pLabel, pField, [ ], [ ]);

const renderFormFieldSpec = (pLabel: Option<AlloySpec>, pField: AlloySpec) => ({
  dom: renderFormFieldDom(),
  components: pLabel.toArray().concat([ pField ])
});

const renderFormFieldSpecWith = (pLabel: Option<AlloySpec>, pField: AlloySpec, extraClasses: string[], extraBehaviours: Behaviour.NamedConfiguredBehaviour<any, any>[]) => ({
  dom: renderFormFieldDomWith(extraClasses),
  components: pLabel.toArray().concat([ pField ]),
  fieldBehaviours: Behaviour.derive(extraBehaviours)
});

const renderFormFieldDom = (): RawDomSchema => renderFormFieldDomWith([ ]);

const renderFormFieldDomWith = (extraClasses): RawDomSchema => ({
  tag: 'div',
  classes: [ 'tox-form__group' ].concat(extraClasses)
});

const renderLabel = (label: string, providersBackstage: UiFactoryBackstageProviders): AlloySpec => AlloyFormField.parts().label({
  dom: {
    tag: 'label',
    classes: [ 'tox-label' ],
    innerHtml: providersBackstage.translate(label)
  }
});

export {
  renderFormField,
  renderFormFieldWith,
  renderFormFieldSpec,
  renderFormFieldDom,
  renderLabel
};
