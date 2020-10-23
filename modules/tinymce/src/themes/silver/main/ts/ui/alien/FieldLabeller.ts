/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloySpec, Behaviour, FormField as AlloyFormField, RawDomSchema, SketchSpec } from '@ephox/alloy';
// TODO: Export properly from alloy.
import { Optional } from '@ephox/katamari';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';

const renderFormFieldWith = (pLabel: Optional<AlloySpec>, pField: AlloySpec, extraClasses: string[], extraBehaviours: Behaviour.NamedConfiguredBehaviour<any, any>[]): SketchSpec => {
  const spec = renderFormFieldSpecWith(pLabel, pField, extraClasses, extraBehaviours);
  return AlloyFormField.sketch(spec);
};

const renderFormField = (pLabel: Optional<AlloySpec>, pField: AlloySpec): SketchSpec => renderFormFieldWith(pLabel, pField, [ ], [ ]);

const renderFormFieldSpec = (pLabel: Optional<AlloySpec>, pField: AlloySpec) => ({
  dom: renderFormFieldDom(),
  components: pLabel.toArray().concat([ pField ])
});

const renderFormFieldSpecWith = (pLabel: Optional<AlloySpec>, pField: AlloySpec, extraClasses: string[], extraBehaviours: Behaviour.NamedConfiguredBehaviour<any, any>[]) => ({
  dom: renderFormFieldDomWith(extraClasses),
  components: pLabel.toArray().concat([ pField ]),
  fieldBehaviours: Behaviour.derive(extraBehaviours)
});

const renderFormFieldDom = (): RawDomSchema => renderFormFieldDomWith([ ]);

const renderFormFieldDomWith = (extraClasses): RawDomSchema => ({
  tag: 'div',
  classes: [ 'tox-form__group' ].concat(extraClasses)
});

const renderLabel = (label: string, providersBackstage: UiFactoryBackstageProviders): AlloySpec => AlloyFormField.parts.label({
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
